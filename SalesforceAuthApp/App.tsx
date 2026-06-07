import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {forceUtil, oauth} from 'react-native-force';

const promisedAuthenticate = forceUtil.promiser(oauth.authenticate);
const promisedGetAuthCredentials = forceUtil.promiser(oauth.getAuthCredentials);
const promisedLogout = forceUtil.promiser(oauth.logout);

export default function App() {
  const [credentials, setCredentials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Checking for an existing Salesforce session...');

  const refreshSession = async () => {
    setLoading(true);
    try {
      const current = (await promisedGetAuthCredentials()) as {
        userName?: string;
        userId?: string;
      };
      setCredentials(current);
      setStatus(`Signed in as ${current.userName ?? current.userId ?? 'Salesforce user'}`);
    } catch (error) {
      setCredentials(null);
      setStatus('No active Salesforce session. Tap “Sign in with Salesforce” to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const current = (await promisedAuthenticate()) as {
        userName?: string;
        userId?: string;
      };
      setCredentials(current);
      setStatus(`Authenticated successfully as ${current.userName ?? current.userId ?? 'Salesforce user'}`);
    } catch (error) {
      Alert.alert('Salesforce auth failed', String(error));
      setStatus('Authentication failed. Check your Connected App settings and redirect URI.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await promisedLogout();
      setCredentials(null);
      setStatus('Logged out of Salesforce.');
    } catch (error) {
      Alert.alert('Logout failed', String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Salesforce auth starter</Text>
        <Text style={styles.subtitle}>
          This screen uses the Salesforce Mobile SDK React Native bridge for OAuth login and logout.
        </Text>

        <View style={styles.buttonRow}>
          <Button title="Sign in with Salesforce" onPress={handleLogin} />
          <Button title="Refresh session" onPress={refreshSession} />
        </View>

        <Button title="Logout" onPress={handleLogout} disabled={!credentials} />

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loaderText}>Working with Salesforce...</Text>
          </View>
        ) : null}

        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{status}</Text>

        <Text style={styles.statusLabel}>Current credentials</Text>
        <Text style={styles.codeValue}>
          {credentials ? JSON.stringify(credentials, null, 2) : 'No active credentials yet.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    gap: 8,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    color: '#e5eefb',
  },
  statusLabel: {
    color: '#93c5fd',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  statusValue: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  codeValue: {
    color: '#bfdbfe',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
