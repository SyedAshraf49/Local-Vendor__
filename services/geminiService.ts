
import { type CartItem, type Recipe } from '../types';

// --- MOCK DATA ---
const MOCK_DAILY_RECIPES: Recipe[] = [
    {
        name: "Chole Bhature (Chola Puri)",
        ingredients: [
            "1 cup chickpeas (chole), soaked overnight",
            "1 onion, finely chopped",
            "2 tomatoes, pureed",
            "1 tsp ginger-garlic paste",
            "Spices: turmeric, chili powder, coriander powder",
            "For Bhature: 2 cups all-purpose flour, 1/4 cup yogurt, pinch of baking soda, oil for frying"
        ],
        instructions: "1. Cook soaked chickpeas until soft. 2. Sauté onions, ginger-garlic paste, and tomato puree. 3. Add spices and cooked chickpeas. Simmer for 15 mins. 4. For bhature, knead dough and let it rest. 5. Roll and deep-fry until golden brown. Serve hot."
    },
    {
        name: "Quick Onion-Tomato Raita",
        ingredients: [
            "1 cup thick yogurt (curd)",
            "1 small onion, finely chopped",
            "1 small tomato, finely chopped",
            "1/4 tsp roasted cumin powder",
            "Salt to taste",
            "Fresh coriander for garnish"
        ],
        instructions: "1. Whisk the yogurt until smooth. 2. Add the chopped onion, tomato, cumin powder, and salt. 3. Mix everything well. 4. Garnish with fresh coriander leaves. Serve chilled."
    },
    {
        name: "Simple Cucumber Salad",
        ingredients: [
            "1 large cucumber, thinly sliced",
            "1/2 lemon, juiced",
            "A pinch of black pepper",
            "Salt to taste"
        ],
        instructions: "1. Place cucumber slices in a bowl. 2. Drizzle with lemon juice. 3. Sprinkle with salt and pepper. 4. Toss gently to combine. Serve immediately for a refreshing side."
    },
    {
        name: "Tomato Rice",
        ingredients: [
            "2 cups cooked rice",
            "2 ripe tomatoes, chopped",
            "1 onion, sliced",
            "1 tsp mustard seeds",
            "1 tsp chili powder",
            "Curry leaves, salt, and 2 tbsp oil"
        ],
        instructions: "1. Heat oil, add mustard seeds and curry leaves. 2. Sauté onions until soft. 3. Add tomatoes, chili powder, and salt; cook until mushy. 4. Add cooked rice and mix well for 2-3 minutes. 5. Serve hot."
    },
    {
        name: "Curd Rice",
        ingredients: [
            "2 cups cooked and cooled rice",
            "1 cup thick curd",
            "2 tbsp milk",
            "1 tsp grated ginger",
            "Tempering: mustard seeds, curry leaves, green chili",
            "Salt to taste"
        ],
        instructions: "1. Mash rice lightly and mix with curd, milk, and salt. 2. Heat a little oil and add mustard seeds, chili, ginger, and curry leaves. 3. Pour tempering over rice and mix. 4. Chill or serve at room temperature."
    },
    {
        name: "Carrot Poriyal",
        ingredients: [
            "2 cups grated carrot",
            "1 tsp mustard seeds",
            "1 tsp urad dal",
            "2 tbsp grated coconut",
            "1 green chili, chopped",
            "Salt and 1 tbsp oil"
        ],
        instructions: "1. Heat oil and splutter mustard seeds, then add urad dal and chili. 2. Add grated carrot and salt. 3. Stir-fry on medium heat for 4-5 minutes. 4. Add coconut, mix, and switch off."
    },
    {
        name: "Banana Milkshake",
        ingredients: [
            "2 ripe bananas",
            "2 cups chilled milk",
            "2 tsp sugar or honey",
            "A pinch of cardamom powder"
        ],
        instructions: "1. Add banana, milk, sugar, and cardamom to a blender. 2. Blend until smooth and frothy. 3. Pour into glasses and serve chilled."
    },
    {
        name: "Veg Sandwich",
        ingredients: [
            "4 bread slices",
            "1 tomato, sliced",
            "1 cucumber, sliced",
            "1 small onion, sliced",
            "2 tbsp butter or mayo",
            "Salt, pepper, and chili flakes"
        ],
        instructions: "1. Spread butter or mayo on bread slices. 2. Layer tomato, cucumber, and onion. 3. Sprinkle salt, pepper, and chili flakes. 4. Cover with another slice and toast if preferred."
    },
    {
        name: "Chocolate Banana Bites",
        ingredients: [
            "2 bananas",
            "1/2 cup melted dark or white chocolate",
            "Crushed nuts (optional)"
        ],
        instructions: "1. Slice bananas into bite-sized pieces. 2. Dip each piece halfway into melted chocolate. 3. Sprinkle nuts if using. 4. Refrigerate for 20 minutes until set."
    },
    {
        name: "Quick Paneer Bhurji",
        ingredients: [
            "200g paneer, crumbled",
            "1 onion, chopped",
            "1 tomato, chopped",
            "1 green chili, chopped",
            "1/2 tsp turmeric and 1/2 tsp chili powder",
            "Salt, coriander, and 1 tbsp oil"
        ],
        instructions: "1. Heat oil, sauté onion and chili until soft. 2. Add tomato and spices; cook until tomato softens. 3. Add crumbled paneer and salt. 4. Cook 3-4 minutes, garnish with coriander, and serve with roti or bread."
    }
];

const MOCK_GENERATED_RECIPE = `
**Simple Tomato and Onion Pasta**

Here is a quick and easy pasta dish you can make with the items in your cart.

**Ingredients:**
- 200g Pasta (any kind)
- 2 large Tomatoes, chopped
- 1 Onion, chopped
- 2 cloves Garlic, minced
- 2 tbsp Olive Oil
- Salt and Pepper to taste
- Fresh basil (optional)

**Instructions:**
1. Cook pasta according to package directions.
2. While pasta is cooking, heat olive oil in a pan over medium heat.
3. Add the chopped onion and garlic and cook until softened (about 5 minutes).
4. Add the chopped tomatoes, salt, and pepper. Cook for 10-12 minutes, until tomatoes break down into a sauce.
5. Drain the cooked pasta and add it to the sauce.
6. Toss everything together to combine.
7. Garnish with fresh basil if desired and serve immediately.
`;
// --- END MOCK DATA ---


export const generateRecipe = async (ingredients: CartItem[], language: 'en' | 'ta'): Promise<string> => {
    console.log("Using mock recipe for ingredients:", ingredients.map(i => i.name).join(', '));
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app with translations, you'd select the mock recipe based on language.
    // For now, we return the English version.
    return MOCK_GENERATED_RECIPE;
};

export const generateDailyRecipes = async (language: 'en' | 'ta'): Promise<Recipe[]> => {
    console.log("Using mock daily recipes.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app with translations, you'd select the mock recipe based on language.
    // For now, we return the English version.
    return MOCK_DAILY_RECIPES;
};
