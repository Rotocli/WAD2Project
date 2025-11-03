// Shop items configuration
// Add this to your existing shop items or create as a separate module

export const fishFoodItems = [
  {
    itemId: 'revival_food',
    name: 'Revival Fish Food',
    description: 'Special food that can bring dead fish back to life! Drag and drop onto a dead fish to revive it.',
    icon: '🍖',
    cost: 0, // Free for now
    itemType: 'fishfood',
    category: 'revival',
    stackable: true,
    maxStack: 99
  }
]

export const allShopItems = {
  fishfood: fishFoodItems,
  // ... other categories (aquarium, fish decorations, etc.)
}
