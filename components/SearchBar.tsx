import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, Sliders } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  onFilterPress, 
  placeholder = "Pesquisar imóveis..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    } else {
      router.push({
        pathname: '/search',
        params: { query }
      });
    }
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      router.push('/filter');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
        <Sliders size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});