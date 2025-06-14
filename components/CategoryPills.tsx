import React from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View 
} from 'react-native';
import Colors from '@/constants/colors';

interface Category {
  id: string;
  label: string;
}

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

export default function CategoryPills({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryPillsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.pill,
              selectedCategory === category.id && styles.selectedPill
            ]}
            onPress={() => onSelectCategory(category.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === category.id && styles.selectedPillText
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  selectedPillText: {
    color: 'white',
  },
});