#
# Script to generate test vectors for the FxA Scoped Keys proposal
#
# This script is designed as an independent implementation of the FxA
# scoped keys protocol, instantiated with one specific deterministic
# set of values for all out-of-band or randomly-generated data.  It
# runs the protocol and prints out the exected values of various
# intermediate states along with the final JWE encrypted key bundle.
#
# To run it, you will need to:
#
#    > pip install jwcrypto hkdf
#

import json
from binascii import hexlify, unhexlify
from base64 import urlsafe_b64encode
from urllib import quote as urlquote
from urlparse import urlparse
from hashlib import sha256

import hkdf
import jwcrypto.jwk
import jwcrypto.jwe


def urlorigin(url):
    p = urlparse(url)
    return p._replace(fragment="", path="", params="", query="").geturl()


def b64url_encode(data):
    return urlsafe_b64encode(data).rstrip('=')


def json_encode(obj):
    # Compact, deterministic JSON encoding.
    return json.dumps(obj, sort_keys=True).replace(' ', '')


# Values stored/generated outside of the protocol

client_id = 'a4dea33c7b40fc34'
redirect_uri = 'https://example.com/oauth_complete'
public_client = True

kB = unhexlify('8b2e1303e21eee06a945683b8d495b9bf079ca30baa37eb8392d9ffa4767be45')
key_rotation_secret = unhexlify('517d478cb4f994aa69930416648a416fdaa1762c5abf401a2acf11a0f185e98d')
key_rotation_timestamp = 1510726317

assert len(kB) == 32
assert len(key_rotation_secret) == 32

# Here's the start of the OAuth dance.
# The relying application generates the necessary random tokens.

state = 'd50209fc504a8393'
print "state:\t\t'{}'".format(state)

code_verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
print "code_verifier:\t'{}'".format(code_verifier)

code_challenge = b64url_encode(sha256(code_verifier).digest())
print "code_challenge:\t'{}'".format(code_challenge)

# And an ephemeral key to secure the handoff of the scoped keys.

keys_jwk_private = {
    "kty": "EC",
    "crv": "P-256",
    "d":   "KXAjjEr4KT9UlYI4BE0BefVdoxP8vqO389U7lQlCigs",
    "x":   "SiBn6uebjigmQqw4TpNzs3AUyCae1_sG2b9Fzhq3Fyo",
    "y":   "q99Xq1RWNTFpk99pdQOSjUvwELss51PkmAGCXhLfMV4"
}

keys_jwk_public = keys_jwk_private.copy()
del keys_jwk_public['d']

keys_jwk = b64url_encode(json_encode(keys_jwk_public))
print "keys_jwk:\t'{}'".format(keys_jwk)

# Then it redirects to FxA web content, where we do the following.

# Authenticate the user, fetch and unwrap kB.

print "kB:\t<{}>".format(hexlify(kB))

# Validate OAuth client details, and fetch scoped-key metadata.

scoped_key_identifier = 'app_key:{}'.format(urlquote(urlorigin(redirect_uri)))
print "scoped_key_identifier:\t'{}'".format(scoped_key_identifier)

print "key_rotation_secret:\t<{}>".format(hexlify(key_rotation_secret))

print "key_rotation_timestamp:\t{}".format(key_rotation_timestamp)

# Calculate the scoped key and its fingerprint via HKDF.

context = 'identity.mozilla.com/picl/v1/scoped_key\n' + scoped_key_identifier
ks_bytes = hkdf.Hkdf(None, kB + key_rotation_secret).expand(context, 16 + 32)

kSfp = ks_bytes[:16]
kS = ks_bytes[16:]

assert len(kS) == 32

print "kSfp:\t<{}>".format(hexlify(kSfp))
print "kS:\t<{}>".format(hexlify(kS))

# Serialize into a JSON key bundle payload.

keys_bundle = json_encode({
    "app_key": {
        "kid": "{}-{}".format(key_rotation_timestamp, b64url_encode(kSfp)),
        "k": b64url_encode(kS),
        "kty": "oct"
    }
})

print "keys_bundle:\t{}".format(keys_bundle)

# Encrypt it into a JWE using an ephemeral key.
# We do some slight hackery here to make the python `jwcrypto` module
# encrypt with a known key and IV.  There's no public API for doing that
# because such a thing would be tremendously unsafe in the real world.

epk = {
    "kty": "EC",
    "crv": "P-256",
    "d": "X9tJG0Ue55tuepC-6msMg04Qv5gJtL95AIJ0X0gDj8Q",
    "x": "N4zPRazB87vpeBgHzFvkvd_48owFYYxEVXRMrOU6LDo",
    "y": "4ncUxN6x_xT1T1kzy_S_V2fYZ7uUJT_HVRNZBLJRsxU"
}
jwcrypto.jwa.JWK.generate = classmethod(lambda c, **k: jwcrypto.jwk.JWK(**epk))

iv = unhexlify('ff4b187fb1dd5ae46fd9c334')
jwcrypto.jwa._randombits = lambda s: iv

jwe = jwcrypto.jwe.JWE(keys_bundle)
jwe.objects['protected'] = '{}'
jwe.add_recipient(jwcrypto.jwk.JWK(**keys_jwk_public), json.dumps({
  "alg": "ECDH-ES",
  "enc": "A256GCM"
}))

keys_jwe = jwe.serialize(compact=True)
print "keys_jwe:\t'{}'".format(keys_jwe)

# Upload it to the sever along with other OAuth data,
# allocating an authorization code.

code = unhexlify('67675750e08865338ed540f9656c4102')
print "code:\t{}".format(hexlify(code))

# Then the client can provide the code in order to fetch the JWE.
