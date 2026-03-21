import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import ConnectionManager, { MeshNode } from '../core/mesh/ConnectionManager';

interface Message {
  id: string;
  text: string;
  isMine: boolean;
  timestamp: string;
}

export default function ChatScreen({ peer, goBack, myIdentity }: { peer: MeshNode, goBack: () => void, myIdentity: { publicKey: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputBox, setInputBox] = useState('');

  const handleSend = () => {
    if (!inputBox.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      text: inputBox,
      isMine: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    
    // In final implementation, we route this through E2EEProtocol.encryptForUser() 
    // before sending via ConnectionManager!
    ConnectionManager.sendMessage(peer.id, inputBox);
    
    setInputBox('');
  };

  const renderBubble = ({ item }: { item: Message }) => {
    return (
      <View style={[styles.bubbleWrapper, item.isMine ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[styles.bubble, item.isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>◀ BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{peer.publicKey || 'Unknown Peer'}</Text>
          <Text style={styles.headerSub}>MAC: {peer.id}</Text>
        </View>
      </View>

      {/* CHAT LOG */}
      <KeyboardAvoidingView 
        style={styles.chatArea} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderBubble}
          contentContainerStyle={styles.listContent}
        />

        {/* INPUT WIDGET */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Terminate Silence..."
            placeholderTextColor="#3F6212"
            value={inputBox}
            onChangeText={setInputBox}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendBtnText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Match Radar Theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  backButton: {
    marginRight: 15,
    padding: 5
  },
  backText: {
    color: '#4ADE80',
    fontWeight: '900',
    fontSize: 16
  },
  headerTitleContainer: {
    flex: 1
  },
  headerTitle: {
    color: '#F0FDF4',
    fontSize: 18,
    fontWeight: 'bold'
  },
  headerSub: {
    color: '#3F6212',
    fontSize: 12
  },
  chatArea: {
    flex: 1
  },
  listContent: {
    padding: 15
  },
  bubbleWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  myWrapper: {
    alignItems: 'flex-end',
  },
  theirWrapper: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
  },
  myBubble: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    color: '#F0FDF4',
    fontSize: 15,
  },
  timestamp: {
    color: '#86EFAC',
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
  },
  inputField: {
    flex: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#4ADE80',
    fontSize: 16,
    maxHeight: 100
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginLeft: 10,
    shadowColor: '#22C55E',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5
  },
  sendBtnText: {
    color: '#022C22',
    fontWeight: '900',
    fontSize: 14
  }
});
