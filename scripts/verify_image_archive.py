"""Verify the observed single-image Docker/OCI export without extracting or loading it.

Only modern image content is identity-bound. Legacy V1 compatibility records are
strictly classified, never used as runtime authority, and their IDs are not
recomputed. Reference: Moby v28.5.1 image/tarexport/{save,load}.go and image/image.go.
This verifier is not a malware scan, safe-execution decision, or legacy loader.
"""
import gzip
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import PurePosixPath
import re
import sys
import tarfile

MAX_BYTES = 8 * 1024 ** 3
MAX_MEMBERS = 4096
MAX_METADATA = 1024 ** 2
MAX_CAPTURE = 8 * MAX_METADATA
CHUNK = 1024 ** 2
BLOB = re.compile(r'blobs/sha256/([a-f0-9]{64})')
DIGEST = re.compile(r'sha256:([a-f0-9]{64})')
LEGACY_ID = re.compile(r'[a-f0-9]{64}')
EPOCH_TIMESTAMP = re.compile(r'([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})'
                             r'(?:\.0{1,9})?(Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])')
INDEX_TYPE = 'application/vnd.oci.image.index.v1+json'
MANIFEST_TYPE = 'application/vnd.oci.image.manifest.v1+json'
CONFIG_TYPE = 'application/vnd.oci.image.config.v1+json'
LAYER_TYPE = 'application/vnd.oci.image.layer.v1.tar'
ROOT_METADATA = frozenset({'manifest.json', 'index.json', 'oci-layout', 'repositories'})
V1_KEYS = frozenset({'id', 'parent', 'comment', 'created', 'container', 'container_config',
                     'docker_version', 'author', 'config', 'architecture', 'variant', 'os', 'Size'})
V1_REQUIRED = frozenset({'id', 'created', 'container_config', 'os'})
# Observed omitted fields; types/defaults from Moby v28.5.1 api/types/container/config.go.
V1_CONFIG_DEFAULTS = {'AttachStderr': False, 'AttachStdin': False, 'AttachStdout': False,
                      'OpenStdin': False, 'StdinOnce': False, 'Tty': False,
                      'Domainname': '', 'Hostname': '', 'Image': '', 'User': '',
                      'Labels': None, 'OnBuild': None, 'Volumes': None}


def require(condition):
    if not condition:
        raise ValueError('image archive verification rejected')


def json_object(data):
    def unique_keys(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result)
            result[key] = value
        return result

    def reject_constant(_value):
        require(False)

    def finite_float(value):
        number = float(value)
        require(math.isfinite(number))
        return number

    return json.loads(data.decode('utf-8', errors='strict'), object_pairs_hook=unique_keys,
                      parse_constant=reject_constant, parse_float=finite_float)


def json_equal(left, right):
    # Preserve JSON boolean/number distinctions; this is not Go ID serialization.
    return json.dumps(left, sort_keys=True, allow_nan=False) == json.dumps(right, sort_keys=True, allow_nan=False)


def config_projection_equal(expected, actual):
    if not isinstance(expected, dict) or not isinstance(actual, dict) or not set(expected).issubset(actual):
        return False
    if not all(json_equal(value, actual[key]) for key, value in expected.items()):
        return False
    return all(key in V1_CONFIG_DEFAULTS and json_equal(value, V1_CONFIG_DEFAULTS[key])
               for key, value in actual.items() if key not in expected)


def object_keys(value, allowed, required=None):
    require(isinstance(value, dict))
    require(set(value).issubset(allowed))
    require((allowed if required is None else required).issubset(value))


def read_members(source, expected):
    records, captured, seen, directories = {}, {}, set(), set()
    total = capture_total = 0
    metadata = ROOT_METADATA | {'blobs/sha256/' + expected[7:]}
    with gzip.GzipFile(fileobj=source, mode='rb') as stream:
        while True:
            header = stream.read(512)
            require(len(header) == 512)
            if header == bytes(512):
                require(stream.read(512) == bytes(512))
                break
            # frombuf parses only this fixed header, never PAX/GNU extension data.
            member = tarfile.TarInfo.frombuf(header, encoding='utf-8', errors='strict')
            require(member.type in (tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE))
            name = member.name.rstrip('/') if member.isdir() else member.name
            path = PurePosixPath(name)
            require(name and not path.is_absolute() and '..' not in path.parts and str(path) == name)
            require(name not in seen and len(seen) < MAX_MEMBERS)
            seen.add(name)
            if member.isdir():
                require(member.size == 0)
                directories.add(name)
                continue
            require(member.size >= 0)
            total += member.size
            require(total <= MAX_BYTES)
            require(name not in metadata or member.size <= MAX_METADATA)
            hasher, pieces, count = hashlib.sha256(), [], 0
            capture = name in metadata
            while count < member.size:
                chunk = stream.read(min(CHUNK, member.size - count))
                require(bool(chunk))
                if count == 0:
                    if BLOB.fullmatch(name) and member.size <= MAX_METADATA and chunk.lstrip().startswith(b'{'):
                        capture = True
                    if capture:
                        capture_total += member.size
                        require(capture_total <= MAX_CAPTURE)
                count += len(chunk)
                hasher.update(chunk)
                if capture:
                    pieces.append(chunk)
            padding = (-member.size) % 512
            require(stream.read(padding) == bytes(padding))
            digest = hasher.hexdigest()
            blob = BLOB.fullmatch(name)
            require(not blob or blob.group(1) == digest)
            records[name] = {'sha256': digest, 'size': member.size}
            if capture:
                captured[name] = b''.join(pieces)
        # Drain all bytes, including gzip trailer/CRC; tar read-ahead is not used.
        trailing = 0
        while True:
            chunk = stream.read(CHUNK)
            if not chunk:
                break
            trailing += len(chunk)
            require(trailing <= MAX_METADATA and not any(chunk))
    require(all(any(name.startswith(directory + '/') for name in records) for directory in directories))
    return records, captured, total


def descriptor_target(descriptor, media_type, records):
    object_keys(descriptor, {'mediaType', 'digest', 'size'})
    require(descriptor['mediaType'] == media_type)
    digest = descriptor['digest']
    require(isinstance(digest, str) and DIGEST.fullmatch(digest) is not None)
    require(type(descriptor['size']) is int and descriptor['size'] >= 0)
    name = 'blobs/sha256/' + digest[7:]
    require(name in records and records[name]['size'] == descriptor['size'])
    require(records[name]['sha256'] == digest[7:])
    return name


def zero_default(value):
    if isinstance(value, dict):
        return all(zero_default(item) for item in value.values())
    if isinstance(value, list):
        return len(value) == 0
    return value is None or value is False or value == '' or (type(value) is int and value == 0)


def is_epoch_instant(value):
    # Go time.Unix(0, 0) uses Local. Only its instant, not a literal UTC suffix, is fixed.
    match = EPOCH_TIMESTAMP.fullmatch(value) if isinstance(value, str) else None
    if match is None or match.group(2) == '-00:00':
        return False
    zone = '+00:00' if match.group(2) == 'Z' else match.group(2)
    try:
        # The regex permits only zero fractional nanos, avoiding microsecond truncation.
        instant = datetime.fromisoformat(match.group(1) + zone).astimezone(timezone.utc)
        return instant == datetime(1970, 1, 1, tzinfo=timezone.utc)
    except (ValueError, OverflowError):
        return False


def validate_auxiliary(names, captured, config, layer_count):
    require(len(names) == layer_count)
    by_id = {}
    for name in names:
        require(BLOB.fullmatch(name) is not None and name in captured)
        item = json_object(captured[name])
        object_keys(item, V1_KEYS, V1_REQUIRED)
        require(isinstance(item['id'], str) and LEGACY_ID.fullmatch(item['id']) is not None)
        require(item['id'] not in by_id)
        require(item['os'] == 'linux' and isinstance(item['container_config'], dict))
        require(item['created'] is None or isinstance(item['created'], str))
        if 'parent' in item:
            require(isinstance(item['parent'], str) and LEGACY_ID.fullmatch(item['parent']) is not None)
        for field in ('comment', 'container', 'docker_version', 'author', 'architecture', 'variant'):
            require(field not in item or isinstance(item[field], str))
        require('config' not in item or isinstance(item['config'], dict))
        require('Size' not in item or (type(item['Size']) is int and item['Size'] >= 0))
        by_id[item['id']] = item
    roots, children = [], {}
    for identifier, item in by_id.items():
        parent = item.get('parent')
        if parent is None:
            roots.append(identifier)
        else:
            require(parent in by_id and parent != identifier and parent not in children)
            children[parent] = identifier
    require(len(roots) == 1)
    chain, visited, current = [], set(), roots[0]
    while current is not None:
        require(current not in visited)
        visited.add(current)
        chain.append(by_id[current])
        current = children.get(current)
    require(len(chain) == layer_count)
    # Source-defined intermediate defaults are structural checks, not CreateID proof.
    for item in chain[:-1]:
        require(set(item).issubset(V1_REQUIRED | {'parent'}))
        require(is_epoch_instant(item['created']) and zero_default(item['container_config']))
    terminal = chain[-1]
    for field in ('architecture', 'os', 'created'):
        require(field in terminal and field in config and json_equal(terminal[field], config[field]))
    require(config_projection_equal(config.get('config'), terminal.get('config')))
    # No Go serialization, legacy ID derivation or legacy loader claim is made.


def validate_modern(records, captured, expected):
    docker = json_object(captured['manifest.json'])
    require(isinstance(docker, list) and len(docker) == 1)
    docker = docker[0]
    object_keys(docker, {'Config', 'Layers', 'RepoTags', 'Parent', 'LayerSources'}, {'Config', 'Layers'})
    require(docker.get('RepoTags') is None or docker.get('RepoTags') == [])
    require(docker.get('Parent') is None or docker.get('Parent') == '')
    if 'repositories' in records:
        require(json_object(captured['repositories']) == {})
    config_name, layers = docker['Config'], docker['Layers']
    require(config_name == 'blobs/sha256/' + expected[7:])
    require(records[config_name]['sha256'] == expected[7:])
    require(isinstance(layers, list) and len(layers) > 0)
    require(all(isinstance(name, str) and BLOB.fullmatch(name) for name in layers))
    require(len(set(layers)) == len(layers) and config_name not in layers)
    config = json_object(captured[config_name])
    require(isinstance(config, dict) and config.get('architecture') == 'amd64' and config.get('os') == 'linux')
    rootfs = config['rootfs']
    object_keys(rootfs, {'type', 'diff_ids'})
    require(rootfs['type'] == 'layers' and isinstance(rootfs['diff_ids'], list))
    diff_ids = rootfs['diff_ids']
    require(len(layers) == len(diff_ids))
    require(all(value == 'sha256:' + records[name]['sha256'] for name, value in zip(layers, diff_ids)))
    layout = json_object(captured['oci-layout'])
    object_keys(layout, {'imageLayoutVersion'})
    require(layout['imageLayoutVersion'] == '1.0.0')
    index = json_object(captured['index.json'])
    object_keys(index, {'schemaVersion', 'mediaType', 'manifests'})
    require(type(index['schemaVersion']) is int and index['schemaVersion'] == 2 and index['mediaType'] == INDEX_TYPE)
    require(isinstance(index['manifests'], list) and len(index['manifests']) == 1)
    manifest_name = descriptor_target(index['manifests'][0], MANIFEST_TYPE, records)
    require(manifest_name not in {config_name, *layers})
    manifest = json_object(captured[manifest_name])
    object_keys(manifest, {'schemaVersion', 'mediaType', 'config', 'layers'})
    require(type(manifest['schemaVersion']) is int and manifest['schemaVersion'] == 2 and manifest['mediaType'] == MANIFEST_TYPE)
    require(descriptor_target(manifest['config'], CONFIG_TYPE, records) == config_name)
    require(isinstance(manifest['layers'], list) and len(manifest['layers']) == len(layers))
    require([descriptor_target(item, LAYER_TYPE, records) for item in manifest['layers']] == layers)
    if 'LayerSources' in docker:
        sources = docker['LayerSources']
        require(isinstance(sources, dict) and set(sources) == set(diff_ids))
        require([descriptor_target(sources[value], LAYER_TYPE, records) for value in diff_ids] == layers)
    return config, layers, {config_name, manifest_name, *layers}


def verify(source, expected):
    require(isinstance(expected, str) and DIGEST.fullmatch(expected) is not None)
    records, captured, total = read_members(source, expected)
    config, layers, core_names = validate_modern(records, captured, expected)
    auxiliary_names = set(records) - ROOT_METADATA - core_names
    validate_auxiliary(auxiliary_names, captured, config, len(layers))
    return {'status': 'modern-image-content-verified', 'imageId': expected, 'architecture': 'amd64', 'os': 'linux',
            'modernImageContentVerified': True, 'archiveStructureAccepted': True, 'layersVerified': len(layers),
            'auxiliaryRecordsClassified': len(auxiliary_names), 'auxiliarySemanticsVerified': False,
            'legacyLoadSupported': False, 'regularMembers': len(records), 'uncompressedMemberBytes': total,
            'extracted': False, 'loaded': False, 'executed': False, 'safeToRun': False}


if __name__ == '__main__':
    try:
        require(len(sys.argv) == 2)
        print(json.dumps(verify(sys.stdin.buffer, sys.argv[1])))
    except Exception:
        print('image archive verification failed', file=sys.stderr)
        sys.exit(1)
