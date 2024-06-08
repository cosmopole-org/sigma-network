import 'dart:convert';
import 'dart:typed_data';

import 'package:libsignal_protocol_dart/libsignal_protocol_dart.dart';

Future<void> main() async {
  await install();
  await groupTest();
}

Future<void> install() async {
  final identityKeyPair = generateIdentityKeyPair();
  final registrationId = generateRegistrationId(false);

  final preKeys = generatePreKeys(0, 110);

  final signedPreKey = generateSignedPreKey(identityKeyPair, 0);

  final sessionStore = InMemorySessionStore();
  final preKeyStore = InMemoryPreKeyStore();
  final signedPreKeyStore = InMemorySignedPreKeyStore();
  final identityStore =
      InMemoryIdentityKeyStore(identityKeyPair, registrationId);

  for (final p in preKeys) {
    await preKeyStore.storePreKey(p.id, p);
  }
  await signedPreKeyStore.storeSignedPreKey(signedPreKey.id, signedPreKey);
}

Uint8List distributionKey = Uint8List(0);
Uint8List encryptedMessage = Uint8List(0);

Future<void> groupEncryptAliceMessage() async {
  const alice = SignalProtocolAddress('+00000000001', 1);
  const groupSender = SenderKeyName('Private group', alice);
  final aliceStore = InMemorySenderKeyStore();

  final aliceSessionBuilder = GroupSessionBuilder(aliceStore);

  final aliceGroupCipher = GroupCipher(aliceStore, groupSender);

  final sentAliceDistributionMessage =
      await aliceSessionBuilder.create(groupSender);
  distributionKey = sentAliceDistributionMessage.serialize();

  encryptedMessage = await aliceGroupCipher
      .encrypt(Uint8List.fromList(utf8.encode('Hello Mixin')));
  print(distributionKey);
  print(encryptedMessage);
}

Future<void> groupDecryptAliceMessage() async {
  const alice = SignalProtocolAddress('+00000000001', 1);
  const groupSender = SenderKeyName('Private group', alice);
  final bobStore = InMemorySenderKeyStore();

  final bobSessionBuilder = GroupSessionBuilder(bobStore);

  final bobGroupCipher = GroupCipher(bobStore, groupSender);

  final receivedAliceDistributionMessage =
      SenderKeyDistributionMessageWrapper.fromSerialized(distributionKey);
  await bobSessionBuilder.process(
      groupSender, receivedAliceDistributionMessage);

  final plaintextFromAlice = await bobGroupCipher.decrypt(encryptedMessage);
  // ignore: avoid_print
  print(utf8.decode(plaintextFromAlice));
}

Future<void> groupTest() async {
  const alice = SignalProtocolAddress('+00000000001', 1);
  const groupSender = SenderKeyName('Private group', alice);
  final aliceStore = InMemorySenderKeyStore();
  final bobStore = InMemorySenderKeyStore();

  final aliceSessionBuilder = GroupSessionBuilder(aliceStore);
  final bobSessionBuilder = GroupSessionBuilder(bobStore);

  final aliceGroupCipher = GroupCipher(aliceStore, groupSender);
  final bobGroupCipher = GroupCipher(bobStore, groupSender);

  final sentAliceDistributionMessage =
      await aliceSessionBuilder.create(groupSender);
  final receivedAliceDistributionMessage =
      SenderKeyDistributionMessageWrapper.fromSerialized(
          sentAliceDistributionMessage.serialize());
  await bobSessionBuilder.process(
      groupSender, receivedAliceDistributionMessage);

  final ciphertextFromAlice = await aliceGroupCipher
      .encrypt(Uint8List.fromList(utf8.encode('Hello Mixin')));
  final plaintextFromAlice = await bobGroupCipher.decrypt(ciphertextFromAlice);
  // ignore: avoid_print
  print(utf8.decode(plaintextFromAlice));
}

Future<void> groupSession() async {
  const senderKeyName = SenderKeyName('', SignalProtocolAddress('sender', 1));
  final senderKeyStore = InMemorySenderKeyStore();
  final groupSession = GroupCipher(senderKeyStore, senderKeyName);
  await groupSession.encrypt(Uint8List.fromList(utf8.encode('Hello Mixin')));
}
