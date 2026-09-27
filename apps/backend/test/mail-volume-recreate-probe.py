"""Synthetic-only mailbox continuity probe run inside a disposable DMS container."""
import hashlib
import imaplib
import json
import os
import smtplib
import ssl
import time
from email.message import EmailMessage
from email.parser import BytesParser
from email.policy import default

ACCOUNT = "rehearsal@example.invalid"
PASSWORD = "SyntheticRehearsalOnly"
BYTES = bytes([0, 1, 127, 128, 255, 10, 13])
IDS = json.loads(os.environ["MAIL_RECREATE_IDS"])
ACTION = os.environ["MAIL_RECREATE_ACTION"]
assert ACTION in {"send", "inspect"}
assert len(IDS) == 2 and len(set(IDS)) == 2
assert all(value.startswith("<recreate-") and value.endswith("@example.invalid>") for value in IDS)
context = ssl.create_default_context(cafile="/fixture-ca.pem")

if ACTION == "send":
    with smtplib.SMTP("localhost", 587, timeout=8) as sender:
        sender.ehlo()
        sender.starttls(context=context)
        sender.login(ACCOUNT, PASSWORD)
        for identifier in IDS:
            message = EmailMessage()
            message["From"] = ACCOUNT
            message["To"] = ACCOUNT
            message["Message-ID"] = identifier
            message["Subject"] = "Synthetic volume continuity"
            message.set_content("synthetic only")
            message.add_attachment(BYTES, maintype="application", subtype="octet-stream", filename="proof.bin")
            sender.send_message(message)

def snapshot(mark_seen=False):
    with imaplib.IMAP4_SSL("localhost", 993, ssl_context=context, timeout=8) as mailbox:
        mailbox.login(ACCOUNT, PASSWORD)
        status, _ = mailbox.select("INBOX", readonly=not mark_seen)
        assert status == "OK"
        validity = mailbox.response("UIDVALIDITY")[1][0].decode()
        status, data = mailbox.uid("search", None, "ALL")
        assert status == "OK"
        found = {}
        for uid in data[0].split():
            status, parts = mailbox.uid("fetch", uid, "(BODY.PEEK[])")
            assert status == "OK"
            entry = next(part for part in parts if isinstance(part, tuple))
            raw = entry[1]
            message = BytesParser(policy=default).parsebytes(raw)
            identifier = message["Message-ID"]
            if identifier not in IDS:
                continue
            assert identifier not in found
            attachments = list(message.iter_attachments())
            assert len(attachments) == 1
            assert attachments[0].get_payload(decode=True) == BYTES
            if mark_seen and identifier == IDS[1]:
                status, _ = mailbox.uid("store", uid, "+FLAGS", "(\\Seen)")
                assert status == "OK"
            status, flags = mailbox.uid("fetch", uid, "(FLAGS)")
            assert status == "OK"
            flag_response = b" ".join(part[0] if isinstance(part, tuple) else part for part in flags if part)
            parsed_flags = imaplib.ParseFlags(flag_response)
            found[identifier] = {
                "uid": uid.decode(),
                "rawHash": hashlib.sha256(raw).hexdigest(),
                "attachmentHash": hashlib.sha256(BYTES).hexdigest(),
                "seen": b"\\Seen" in parsed_flags,
            }
        return {"uidValidity": validity, "messages": found}

deadline = time.monotonic() + 20
while True:
    result = snapshot(mark_seen=ACTION == "send")
    if len(result["messages"]) == 2:
        break
    if time.monotonic() >= deadline:
        raise AssertionError("Synthetic messages did not arrive")
    time.sleep(0.2)
if ACTION == "send":
    result = snapshot()
assert result["messages"][IDS[0]]["seen"] is False
assert result["messages"][IDS[1]]["seen"] is True
print(json.dumps(result, sort_keys=True))
