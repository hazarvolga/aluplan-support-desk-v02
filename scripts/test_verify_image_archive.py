"""Synthetic-only tests; never read or execute a real image."""
import copy
import gzip
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).with_name('verify_image_archive.py')
spec = importlib.util.spec_from_file_location('image_verifier', SCRIPT)
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)


def encode(value):
    return json.dumps(value, separators=(',', ':')).encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def blob(value):
    return 'blobs/sha256/' + digest(value)


def tar_bytes(entries):
    result = io.BytesIO()
    with tarfile.open(fileobj=result, mode='w', format=tarfile.USTAR_FORMAT) as archive:
        for name, value in entries:
            member = tarfile.TarInfo(name)
            member.size = len(value)
            archive.addfile(member, io.BytesIO(value))
    return result.getvalue()


def fixture(aux_change=None, manifest_change=None, index_change=None,
            docker_change=None, config_change=None, entries_change=None):
    layers = [b'synthetic first layer', b'synthetic second layer', b'synthetic final layer']
    config = {'architecture': 'amd64', 'os': 'linux', 'created': '2026-09-22T00:00:00Z',
              'config': {'Env': ['PRIVATE_ENV_CANARY=secret'], 'Labels': {'private': 'PRIVATE_LABEL_CANARY'}},
              'history': [{'created_by': 'PRIVATE_HISTORY_CANARY'}],
              'rootfs': {'type': 'layers', 'diff_ids': ['sha256:' + digest(layer) for layer in layers]}}
    if config_change:
        config_change(config)
    config_bytes = encode(config)
    expected = 'sha256:' + digest(config_bytes)
    descriptors = [{'mediaType': 'application/vnd.oci.image.layer.v1.tar',
                    'digest': 'sha256:' + digest(layer), 'size': len(layer)} for layer in layers]
    manifest = {'schemaVersion': 2, 'mediaType': 'application/vnd.oci.image.manifest.v1+json',
                'config': {'mediaType': 'application/vnd.oci.image.config.v1+json',
                           'digest': expected, 'size': len(config_bytes)}, 'layers': copy.deepcopy(descriptors)}
    if manifest_change:
        manifest_change(manifest)
    manifest_bytes = encode(manifest)
    index = {'schemaVersion': 2, 'mediaType': 'application/vnd.oci.image.index.v1+json',
             'manifests': [{'mediaType': manifest['mediaType'], 'digest': 'sha256:' + digest(manifest_bytes),
                            'size': len(manifest_bytes)}]}
    if index_change:
        index_change(index)
    docker = {'Config': blob(config_bytes), 'Layers': [blob(layer) for layer in layers], 'RepoTags': None,
              'LayerSources': {item['digest']: copy.deepcopy(item) for item in descriptors}}
    if docker_change:
        docker_change(docker)
    ids = [character * 64 for character in 'abc']
    auxiliary = [{'id': ids[0], 'created': '1970-01-01T00:00:00Z', 'container_config': {'Env': None}, 'os': 'linux'},
                 {'id': ids[1], 'parent': ids[0], 'created': '1970-01-01T00:00:00Z',
                  'container_config': {'Cmd': None, 'AttachStdin': False}, 'os': 'linux'},
                 {'id': ids[2], 'parent': ids[1], 'created': config['created'], 'container_config': {},
                  'config': copy.deepcopy(config['config']), 'architecture': config['architecture'], 'os': config['os']}]
    if aux_change:
        aux_change(auxiliary)
    entries = [(blob(config_bytes), config_bytes), *[(blob(layer), layer) for layer in layers],
               (blob(manifest_bytes), manifest_bytes), ('index.json', encode(index)),
               ('oci-layout', encode({'imageLayoutVersion': '1.0.0'})), ('manifest.json', encode([docker])),
               *[(blob(encode(item)), encode(item)) for item in auxiliary]]
    if entries_change:
        entries = entries_change(entries)
    return gzip.compress(tar_bytes(entries)), expected


class ImageArchiveTests(unittest.TestCase):
    def verify_fixture(self, **kwargs):
        data, expected = fixture(**kwargs)
        return verifier.verify(io.BytesIO(data), expected)

    def reject_fixture(self, **kwargs):
        with self.assertRaises((ValueError, KeyError, TypeError, EOFError, tarfile.HeaderError)):
            self.verify_fixture(**kwargs)

    def test_valid_observed_layout_and_explicit_scope(self):
        result = self.verify_fixture()
        self.assertEqual(result['layersVerified'], 3)
        self.assertEqual(result['auxiliaryRecordsClassified'], 3)
        self.assertTrue(result['modernImageContentVerified'])
        self.assertTrue(result['archiveStructureAccepted'])
        for name in ('auxiliarySemanticsVerified', 'legacyLoadSupported', 'extracted', 'loaded', 'executed', 'safeToRun'):
            self.assertIs(result[name], False)
        self.assertEqual(result['regularMembers'], 11)

    def test_optional_empty_legacy_fields(self):
        self.verify_fixture(docker_change=lambda value: value.update(RepoTags=[], Parent=''),
                            entries_change=lambda entries: entries + [('repositories', b'{}')])
        self.verify_fixture(docker_change=lambda value: value.pop('LayerSources'))

    def test_nonempty_or_wrongtype_legacy_fields(self):
        for value in [{'RepoTags': ['private:tag']}, {'RepoTags': ''}, {'Parent': 'a' * 64}, {'Parent': []}, {'unknown': True}]:
            with self.subTest(value=value):
                self.reject_fixture(docker_change=lambda item: item.update(value))
        self.reject_fixture(entries_change=lambda entries: entries + [('repositories', b'{"private":{}}')])

    def test_config_identity_and_layer_corruption(self):
        data, _ = fixture()
        with self.assertRaises((ValueError, KeyError)):
            verifier.verify(io.BytesIO(data), 'sha256:' + '0' * 64)
        self.reject_fixture(entries_change=lambda entries: [(name, value + b'!' if index == 0 else value)
                                                            for index, (name, value) in enumerate(entries)])
        self.reject_fixture(entries_change=lambda entries: [(name, b'changed layer' if index == 1 else value)
                                                            for index, (name, value) in enumerate(entries)])

    def test_platform_rootfs_and_docker_layer_order(self):
        for change in [lambda item: item.update(architecture='arm64'), lambda item: item.update(os='windows'),
                       lambda item: item['rootfs'].update(type='unknown'),
                       lambda item: item['rootfs'].update(diff_ids=[]),
                       lambda item: item['rootfs'].update(diff_ids=list(reversed(item['rootfs']['diff_ids'])))]:
            self.reject_fixture(config_change=change)
        self.reject_fixture(docker_change=lambda item: item['Layers'].reverse())
        self.reject_fixture(docker_change=lambda item: item['Layers'].append(item['Layers'][0]))

    def test_index_contract(self):
        for change in [lambda item: item.update(schemaVersion=True), lambda item: item.update(schemaVersion=2.0),
                       lambda item: item.update(mediaType='unknown'), lambda item: item.update(extra=True),
                       lambda item: item.update(manifests=[]),
                       lambda item: item['manifests'].append(copy.deepcopy(item['manifests'][0])),
                       lambda item: item['manifests'][0].update(size=True),
                       lambda item: item['manifests'][0].update(size=1),
                       lambda item: item['manifests'][0].update(digest='sha256:' + '0' * 64),
                       lambda item: item['manifests'][0].update(urls=['https://private.invalid']),
                       lambda item: item['manifests'][0].update(data='PRIVATE_INLINE_DATA')]:
            self.reject_fixture(index_change=change)

    def test_oci_manifest_contract(self):
        for change in [lambda item: item.update(schemaVersion=True), lambda item: item.update(extra=True),
                       lambda item: item['config'].update(size=1),
                       lambda item: item['config'].update(digest=item['layers'][0]['digest']),
                       lambda item: item['config'].update(urls=[]),
                       lambda item: item['layers'].reverse(), lambda item: item['layers'].pop(),
                       lambda item: item['layers'][0].update(size=-1),
                       lambda item: item['layers'][0].update(mediaType='application/vnd.oci.image.layer.v1.tar+gzip'),
                       lambda item: item['layers'][0].update(annotations={'private': 'PRIVATE_ANNOTATION'})]:
            self.reject_fixture(manifest_change=change)

    def test_layer_sources_contract(self):
        self.reject_fixture(docker_change=lambda item: item.update(LayerSources=[]))
        self.reject_fixture(docker_change=lambda item: item.update(LayerSources={}))
        self.reject_fixture(docker_change=lambda item: next(iter(item['LayerSources'].values())).update(size=1))
        self.reject_fixture(docker_change=lambda item: next(iter(item['LayerSources'].values())).update(urls=[]))

    def test_auxiliary_count_schema_and_types(self):
        changes = [lambda items: items.pop(), lambda items: items.append({'id': 'd' * 64}),
                   lambda items: items[0].update(id='A' * 64), lambda items: items[0].update(parent=12),
                   lambda items: items[0].update(os='windows'), lambda items: items[0].update(rootfs={}),
                   lambda items: items[0].update(created=0), lambda items: items[0].update(Size=True),
                   lambda items: items[0].update(container_config=[]), lambda items: items[0].update(author=1),
                   lambda items: items[-1].update(config=None)]
        for change in changes:
            self.reject_fixture(aux_change=change)

    def test_auxiliary_chain_rejections(self):
        for change in [lambda items: items[1].update(id=items[0]['id']),
                       lambda items: items[1].pop('parent'),
                       lambda items: items[1].update(parent='d' * 64),
                       lambda items: items[1].update(parent=items[1]['id']),
                       lambda items: items[0].update(parent=items[-1]['id']),
                       lambda items: items[-1].update(parent=items[0]['id'])]:
            self.reject_fixture(aux_change=change)

    def test_auxiliary_intermediate_and_terminal_projection(self):
        for change in [lambda items: items[0].update(created='2026-01-01T00:00:00Z'),
                       lambda items: items[0].update(container_config={'Env': ['PRIVATE_UNEXPECTED_VALUE']}),
                       lambda items: items[0].update(config={}),
                       lambda items: items[-1].update(architecture='arm64'),
                       lambda items: items[-1].update(created='2026-01-01T00:00:00Z'),
                       lambda items: items[-1].update(config={'Env': ['PRIVATE_SUBSTITUTED_ENV']})]:
            self.reject_fixture(aux_change=change)

    def test_different_structural_ids_never_claim_legacy_equivalence(self):
        def change(items):
            for index, item in enumerate(items):
                item['id'] = 'def'[index] * 64
                if index:
                    item['parent'] = 'def'[index - 1] * 64
        self.assertFalse(self.verify_fixture(aux_change=change)['auxiliarySemanticsVerified'])

    def test_terminal_projection_distinguishes_boolean_from_integer(self):
        for original, replacement in [(False, 0), (True, 1)]:
            self.reject_fixture(config_change=lambda item: item['config'].update(AttachStdin=original),
                                aux_change=lambda items: items[-1]['config'].update(AttachStdin=replacement))

    def test_json_float_overflow_rejected(self):
        for content in (b'{"value":1e999}', b'{"value":-1e999}'):
            with self.assertRaises(ValueError):
                verifier.json_object(content)
        self.assertEqual(verifier.json_object(b'{"value":1.5}'), {'value': 1.5})

    def test_json_requires_plain_utf8(self):
        for filename, encoding in [('manifest.json', 'utf-16'), ('manifest.json', 'utf-8-sig'),
                                   ('index.json', 'utf-32')]:
            self.reject_fixture(entries_change=lambda entries: [
                (name, value.decode('utf-8').encode(encoding) if name == filename else value)
                for name, value in entries])

    def test_intermediate_epoch_accepts_equivalent_timezone_offsets(self):
        for timestamp in ('1970-01-01T00:00:00Z', '1970-01-01T01:00:00+01:00',
                          '1969-12-31T19:00:00-05:00', '1970-01-01T05:30:00+05:30',
                          '1970-01-01T00:00:00.000000000+00:00'):
            with self.subTest(timestamp=timestamp):
                self.verify_fixture(aux_change=lambda items: [item.update(created=timestamp) for item in items[:-1]])

    def test_intermediate_epoch_rejects_nonzero_or_invalid_instants(self):
        for timestamp in ('1970-01-01T00:00:01Z', '1970-01-01T00:00:00.000000001Z',
                          '1969-12-31T23:59:59.999999999Z', '1970-01-01T00:00:00',
                          '1970-01-01 00:00:00Z', '1970-02-30T00:00:00Z',
                          '1970-01-01T00:00:00+24:00', '1970-01-01T00:00:00+00:60',
                          '1970-01-01T00:00:60Z', '1970-01-01T00:00:00-00:00',
                          '1970-01-01T00:00:00.0000000000Z', None, 0):
            with self.subTest(timestamp=timestamp):
                self.reject_fixture(aux_change=lambda items: items[0].update(created=timestamp))

    def test_terminal_config_accepts_only_known_omitted_defaults(self):
        defaults = {'AttachStderr': False, 'AttachStdin': False, 'AttachStdout': False, 'OpenStdin': False,
                    'StdinOnce': False, 'Tty': False, 'Domainname': '', 'Hostname': '', 'Image': '', 'User': '',
                    'Labels': None, 'OnBuild': None, 'Volumes': None}
        self.verify_fixture(config_change=lambda item: item['config'].pop('Labels'),
                            aux_change=lambda items: items[-1]['config'].update(defaults))

    def test_terminal_config_rejects_unknown_nondefault_or_wrongtype_additions(self):
        additions = ({'UnknownField': ''}, {'AttachStdin': 0}, {'AttachStderr': True}, {'OpenStdin': None},
                     {'Domainname': None}, {'Hostname': 'not-default'}, {'Image': False}, {'User': 0},
                     {'OnBuild': []}, {'Volumes': {}}, {'Labels': ''})
        for addition in additions:
            with self.subTest(addition=addition):
                self.reject_fixture(config_change=lambda item: item['config'].pop('Labels'),
                                    aux_change=lambda items: items[-1]['config'].update(addition))

    def test_terminal_config_never_drops_or_changes_expected_keys(self):
        self.reject_fixture(aux_change=lambda items: items[-1]['config'].pop('Env'))
        self.reject_fixture(aux_change=lambda items: items[-1]['config'].update(Labels=None))

    def test_unknown_and_duplicate_members(self):
        for change in [lambda entries: entries + [entries[0]], lambda entries: entries + [('unknown', b'x')],
                       lambda entries: entries + [(blob(b'{}'), b'{}')],
                       lambda entries: entries + [('../escape', b'x')],
                       lambda entries: entries + [('/absolute', b'x')],
                       lambda entries: entries + [('./manifest.json', b'[]')]]:
            self.reject_fixture(entries_change=change)

    def test_duplicate_json_keys_nonfinite_and_wrong_json_shapes(self):
        for content in [b'{"schemaVersion":2,"schemaVersion":2}', b'{"schemaVersion":NaN}',
                        b'{"schemaVersion":Infinity}', b'[]', b'null']:
            self.reject_fixture(entries_change=lambda entries: [(name, content if name == 'index.json' else value)
                                                                for name, value in entries])
        self.reject_fixture(entries_change=lambda entries: [(name, b'[]' if name == 'manifest.json' else value)
                                                            for name, value in entries])

    def test_metadata_and_member_limits(self):
        data, expected = fixture()
        for field, maximum in [('MAX_MEMBERS', 1), ('MAX_BYTES', 1), ('MAX_METADATA', 1), ('MAX_CAPTURE', 1)]:
            with patch.object(verifier, field, maximum), self.assertRaises(ValueError):
                verifier.verify(io.BytesIO(data), expected)

    def test_special_headers_and_orphan_directory(self):
        data, expected = fixture()
        raw = gzip.decompress(data)
        for kind in [tarfile.SYMTYPE, tarfile.LNKTYPE, tarfile.FIFOTYPE, tarfile.GNUTYPE_LONGNAME,
                     tarfile.XHDTYPE, tarfile.XGLTYPE, tarfile.GNUTYPE_SPARSE, tarfile.DIRTYPE]:
            member = tarfile.TarInfo('orphan')
            member.type = kind
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                verifier.verify(io.BytesIO(gzip.compress(member.tobuf() + raw)), expected)

    def test_valid_directories(self):
        data, expected = fixture()
        prefixes = []
        for name in ('blobs/', 'blobs/sha256/'):
            member = tarfile.TarInfo(name)
            member.type = tarfile.DIRTYPE
            prefixes.append(member.tobuf())
        verifier.verify(io.BytesIO(gzip.compress(b''.join(prefixes) + gzip.decompress(data))), expected)

    def test_padding_end_blocks_and_truncated_gzip(self):
        data, expected = fixture()
        raw = bytearray(gzip.decompress(data))
        member = tarfile.TarInfo.frombuf(raw[:512], 'utf-8', 'strict')
        raw[512 + member.size] = 1
        for bad in (gzip.compress(raw), gzip.compress(gzip.decompress(data)[:-1] + b'!'), data[:-8], data[:20]):
            with self.assertRaises((ValueError, EOFError, gzip.BadGzipFile)):
                verifier.verify(io.BytesIO(bad), expected)

    def test_cli_output_never_contains_private_values(self):
        data, expected = fixture()
        result = subprocess.run([sys.executable, '-B', str(SCRIPT), expected], input=data, capture_output=True, timeout=5)
        self.assertEqual(result.returncode, 0)
        self.assertTrue(json.loads(result.stdout)['modernImageContentVerified'])
        self.assertEqual(result.stderr, b'')
        self.assertNotIn(b'PRIVATE_', result.stdout)
        for arguments, content in [([expected], data[:-8]), (['PRIVATE_EXPECTED_VALUE'], data), ([], b'')]:
            result = subprocess.run([sys.executable, '-B', str(SCRIPT), *arguments], input=content,
                                    capture_output=True, timeout=5)
            self.assertEqual(result.returncode, 1)
            self.assertEqual(result.stdout, b'')
            self.assertEqual(result.stderr, b'image archive verification failed\n')


if __name__ == '__main__':
    unittest.main()
