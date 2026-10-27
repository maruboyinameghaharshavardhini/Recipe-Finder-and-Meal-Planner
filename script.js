
const recipes = [
    {
        id: 1, name: "Avocado Toast", category: "Breakfast",
        emoji: "🥑", time: 10, servings: 2, vegetarian: true,
        description: "A fresh and creamy breakfast to start your day.",
        ingredients: ["4 slices whole-grain bread", "1 avocado", "1 lemon", "Salt", "Black pepper"],
        instructions: ["Toast the bread until golden.", "Mash the avocado with lemon juice, salt, and pepper.", "Spread the avocado mixture on the toast and serve."]
    },
    {
        id: 2, name: "Masala Dosa", category: "Breakfast",
        emoji: "🥞", time: 30, servings: 2, vegetarian: true,
        description: "Crispy dosa filled with flavorful potato masala.",
        ingredients: ["2 cups dosa batter", "3 potatoes", "1 onion", "1 tsp mustard seeds", "Curry leaves", "Cooking oil"],
        instructions: ["Boil and mash the potatoes.", "Cook onion, mustard seeds, and curry leaves in a little oil. Mix in the potatoes.", "Spread dosa batter on a hot pan, cook until crisp, and add the filling."]
    },
    {
        id: 3, name: "Veg Fried Rice", category: "Lunch",
        emoji: "🍚", time: 20, servings: 2, vegetarian: true,
        description: "Colorful vegetables tossed with rice and simple spices.",
        ingredients: ["2 cups cooked rice", "1 carrot", "1 capsicum", "1 cup cabbage", "2 tbsp soy sauce", "2 garlic cloves", "Cooking oil"],
        instructions: ["Chop all vegetables and garlic.", "Heat oil and sauté the garlic and vegetables.", "Add cooked rice and soy sauce. Toss everything together and serve."]
    },
    {
        id: 4, name: "Paneer Curry", category: "Dinner",
        emoji: "🍛", time: 30, servings: 3, vegetarian: true,
        description: "A comforting Indian curry with soft paneer cubes.",
        ingredients: ["200 g paneer", "2 tomatoes", "1 onion", "1 tsp ginger-garlic paste", "1 tsp garam masala", "1/2 cup milk", "Cooking oil"],
        instructions: ["Chop the onion and tomatoes.", "Cook the onion, ginger-garlic paste, and tomatoes with spices.", "Add milk and paneer cubes. Simmer gently until the curry thickens."]
    },
    {
        id: 5, name: "Fruit Salad", category: "Snacks",
        emoji: "🍓", time: 10, servings: 2, vegetarian: true,
        description: "A refreshing mix of naturally sweet fruits.",
        ingredients: ["1 apple", "1 banana", "1 cup grapes", "1 orange", "1/2 lemon"],
        instructions: ["Wash and prepare the fruit.", "Cut the fruit into bite-sized pieces.", "Mix gently with a little lemon juice and serve fresh."]
    },
    {
        id: 6, name: "Veggie Sandwich", category: "Lunch",
        emoji: "🥪", time: 15, servings: 2, vegetarian: true,
        description: "A crunchy sandwich filled with fresh vegetables.",
        ingredients: ["4 bread slices", "1 cucumber", "1 tomato", "1 carrot", "2 tbsp butter", "2 tbsp green chutney"],
        instructions: ["Wash and slice the vegetables.", "Spread butter and chutney on the bread.", "Add the vegetables, close the sandwich, and slice to serve."]
    },
    {
        id: 7, name: "Chocolate Pancakes", category: "Breakfast",
        emoji: "🥞", time: 20, servings: 2, vegetarian: true,
        description: "Soft, fluffy pancakes with a chocolate flavor.",
        ingredients: ["1 cup flour", "1 tbsp cocoa powder", "1 egg", "3/4 cup milk", "2 tbsp sugar", "1 tsp baking powder", "Butter"],
        instructions: ["Mix flour, cocoa powder, sugar, and baking powder.", "Whisk in the egg and milk until smooth.", "Cook small portions in a buttered pan, flipping once bubbles appear."]
    },
    {
        id: 8, name: "Tomato Pasta", category: "Dinner",
        emoji: "🍝", time: 25, servings: 2, vegetarian: true,
        description: "Easy pasta tossed in a homemade tomato sauce.",
        ingredients: ["200 g pasta", "3 tomatoes", "3 garlic cloves", "1 onion", "1 tsp mixed herbs", "2 tbsp olive oil", "Salt"],
        instructions: ["Boil the pasta according to the packet instructions.", "Sauté garlic and onion in olive oil, then add chopped tomatoes and herbs.", "Mix in the cooked pasta, season with salt, and serve."]
    }
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch {
        return fallback;
    }
}

let favorites = loadData("recipenest-favorites", []);
let mealPlan = loadData("recipenest-meals", []);
let checkedItems = loadData("recipenest-checked", []);
let activeCategory = "All";
let favoritesOnly = false;
let searchText = "";
let toastTimer;

const $ = id => document.getElementById(id);

function saveData() {
    try {
        localStorage.setItem("recipenest-favorites", JSON.stringify(favorites));
        localStorage.setItem("recipenest-meals", JSON.stringify(mealPlan));
        localStorage.setItem("recipenest-checked", JSON.stringify(checkedItems));
    } catch {
        showToast("Unable to save data in this browser.");
    }
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function updateStats() {
    $("recipeCount").textContent = recipes.length;
    $("plannedCount").textContent = mealPlan.length;
    $("savedCount").textContent = favorites.length;
    $("favoriteCount").textContent = favorites.length;
}

function renderRecipes() {
    const query = searchText.toLowerCase();

    const filtered = recipes.filter(recipe => {
        const matchesCategory =
            activeCategory === "All" ||
            recipe.category === activeCategory ||
            (activeCategory === "Vegetarian" && recipe.vegetarian);

        const matchesFavorites = !favoritesOnly || favorites.includes(recipe.id);

        const searchable = [
            recipe.name,
            recipe.category,
            recipe.description,
            ...recipe.ingredients
        ].join(" ").toLowerCase();

        return matchesCategory && matchesFavorites && searchable.includes(query);
    });

    $("recipeGrid").innerHTML = filtered.map(recipe => `
    <article class="recipe-card">
      <div class="recipe-art">
        <span>${recipe.emoji}</span>
        <button class="favorite-btn ${favorites.includes(recipe.id) ? "saved" : ""}"
          data-favorite="${recipe.id}"
          aria-label="${favorites.includes(recipe.id) ? "Remove from" : "Add to"} favorites">
          ${favorites.includes(recipe.id) ? "♥" : "♡"}
        </button>
      </div>
      <div class="recipe-info">
        <span class="recipe-category">${escapeHTML(recipe.category)}</span>
        <h3>${escapeHTML(recipe.name)}</h3>
        <p>${escapeHTML(recipe.description)}</p>
        <div class="recipe-meta">
          <span>◷ ${recipe.time} min</span>
          <span>🍽 ${recipe.servings} servings</span>
        </div>
        <div class="card-actions">
          <button class="view-btn" data-view="${recipe.id}">View Recipe</button>
          <button class="plan-btn" data-quick-plan="${recipe.id}">+ Plan</button>
        </div>
      </div>
    </article>
  `).join("");

    $("emptyRecipes").classList.toggle("hidden", filtered.length > 0);

    $("resultLabel").textContent = favoritesOnly
        ? `${filtered.length} favorite recipe${filtered.length === 1 ? "" : "s"}`
        : `Showing ${filtered.length} of ${recipes.length} recipes`;

    $("favoritesButton").innerHTML =
        `${favoritesOnly ? "♥ All Recipes" : "♥ Favorites"} <span id="favoriteCount">${favorites.length}</span>`;
}

function renderRecipeOptions() {
    $("planRecipe").innerHTML = recipes.map(recipe =>
        `<option value="${recipe.id}">${escapeHTML(recipe.name)}</option>`
    ).join("");
}

function addMeal(recipeId, day, meal) {
    const recipe = recipes.find(item => item.id === Number(recipeId));
    if (!recipe) return;

    const exists = mealPlan.some(item =>
        item.day === day && item.meal === meal && item.recipeId === recipe.id
    );

    if (exists) {
        showToast("This recipe is already in that meal slot.");
        return;
    }

    mealPlan.push({
        id: Date.now() + Math.random(),
        recipeId: recipe.id,
        day,
        meal
    });

    saveData();
    renderPlanner();
    renderShoppingList();
    updateStats();
    showToast(`${recipe.name} added to ${day}'s ${meal.toLowerCase()}!`);
}

function renderPlanner() {
    $("plannerSummary").textContent =
        `${mealPlan.length} meal${mealPlan.length === 1 ? "" : "s"} planned this week`;

    $("weekGrid").innerHTML = DAYS.map(day => {
        const dayMeals = mealPlan.filter(item => item.day === day);

        return `
      <article class="day-card">
        <h3>${day}</h3>
        ${dayMeals.length === 0
                ? `<p class="day-empty">Nothing planned yet</p>`
                : dayMeals.map(item => {
                    const recipe = recipes.find(r => r.id === item.recipeId);
                    if (!recipe) return "";

                    return `
                <div class="planned-meal">
                  <small>${escapeHTML(item.meal)}</small>
                  <strong>${recipe.emoji} ${escapeHTML(recipe.name)}</strong>
                  <button class="remove-meal" data-remove-meal="${item.id}">Remove</button>
                </div>
              `;
                }).join("")
            }
      </article>
    `;
    }).join("");
}

function getShoppingItems() {
    const items = new Map();

    mealPlan.forEach(meal => {
        const recipe = recipes.find(item => item.id === meal.recipeId);
        if (!recipe) return;

        recipe.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase();
            if (!items.has(key)) items.set(key, ingredient);
        });
    });

    return [...items.values()].sort((a, b) => a.localeCompare(b));
}

function renderShoppingList() {
    const items = getShoppingItems();
    const checkedSet = new Set(checkedItems);

    $("shoppingSummary").textContent = items.length
        ? `${items.length} unique ingredients from your planned meals`
        : "Plan meals to create your shopping list.";

    $("shoppingList").innerHTML = items.length
        ? items.map((ingredient, index) => {
            const checked = checkedSet.has(ingredient);
            return `
          <div class="shopping-item ${checked ? "checked" : ""}">
            <input type="checkbox" id="ingredient-${index}"
              data-ingredient="${escapeHTML(ingredient)}" ${checked ? "checked" : ""}>
            <label for="ingredient-${index}">${escapeHTML(ingredient)}</label>
          </div>
        `;
        }).join("")
        : `<p class="day-empty">Your shopping list is empty. Add meals to your planner first.</p>`;

    const checkedCount = items.filter(item => checkedSet.has(item)).length;
    $("checkedSummary").textContent = `${checkedCount} of ${items.length} items checked`;
}

function showRecipe(recipeId) {
    const recipe = recipes.find(item => item.id === Number(recipeId));
    if (!recipe) return;

    $("modalBody").innerHTML = `
    <div class="modal-emoji">${recipe.emoji}</div>
    <span class="recipe-category">${escapeHTML(recipe.category)}</span>
    <h2 id="modalTitle">${escapeHTML(recipe.name)}</h2>
    <p>${escapeHTML(recipe.description)}</p>
    <div class="modal-meta">◷ ${recipe.time} minutes &nbsp; · &nbsp; 🍽 ${recipe.servings} servings</div>

    <h3>🧺 Ingredients</h3>
    <ul>${recipe.ingredients.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>

    <h3>👩‍🍳 Cooking instructions</h3>
    <ol>${recipe.instructions.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ol>

    <button class="primary-btn" id="modalPlanButton">+ Add to Meal Planner</button>
  `;

    $("recipeModal").classList.remove("hidden");
    $("modalPlanButton").addEventListener("click", () => {
        $("planRecipe").value = String(recipe.id);
        $("recipeModal").classList.add("hidden");
        $("planner").scrollIntoView({ behavior: "smooth" });
        showToast("Choose a day and meal, then click Add Meal.");
    });
}

function closeModal() {
    $("recipeModal").classList.add("hidden");
}

function refresh() {
    renderRecipes();
    renderPlanner();
    renderShoppingList();
    updateStats();
}

$("searchInput").addEventListener("input", event => {
    searchText = event.target.value.trim();
    renderRecipes();
});

$("clearSearch").addEventListener("click", () => {
    $("searchInput").value = "";
    searchText = "";
    renderRecipes();
});

$("filters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;
    favoritesOnly = false;

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn === button);
    });

    renderRecipes();
});

$("favoritesButton").addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    activeCategory = "All";

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === "All");
    });

    $("recipes").scrollIntoView({ behavior: "smooth" });
    renderRecipes();
});

$("recipeGrid").addEventListener("click", event => {
    const favoriteButton = event.target.closest("[data-favorite]");
    const viewButton = event.target.closest("[data-view]");
    const planButton = event.target.closest("[data-quick-plan]");

    if (favoriteButton) {
        const id = Number(favoriteButton.dataset.favorite);

        favorites = favorites.includes(id)
            ? favorites.filter(item => item !== id)
            : [...favorites, id];

        saveData();
        refresh();
        showToast(favorites.includes(id) ? "Added to favorites!" : "Removed from favorites.");
    }

    if (viewButton) showRecipe(viewButton.dataset.view);

    if (planButton) {
        $("planRecipe").value = planButton.dataset.quickPlan;
        $("planner").scrollIntoView({ behavior: "smooth" });
        showToast("Choose a day and meal, then click Add Meal.");
    }
});

$("addMealButton").addEventListener("click", () => {
    addMeal($("planRecipe").value, $("planDay").value, $("planMeal").value);
});

$("weekGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-remove-meal]");
    if (!button) return;

    const id = Number(button.dataset.removeMeal);
    mealPlan = mealPlan.filter(item => item.id !== id);

    const remainingItems = getShoppingItems();
    checkedItems = checkedItems.filter(item => remainingItems.includes(item));

    saveData();
    refresh();
    showToast("Meal removed from your plan.");
});

$("shoppingList").addEventListener("change", event => {
    const input = event.target.closest("[data-ingredient]");
    if (!input) return;

    const ingredient = input.dataset.ingredient;

    checkedItems = input.checked
        ? [...new Set([...checkedItems, ingredient])]
        : checkedItems.filter(item => item !== ingredient);

    saveData();
    renderShoppingList();
});

$("clearCheckedButton").addEventListener("click", () => {
    checkedItems = [];
    saveData();
    renderShoppingList();
    showToast("Checked items cleared.");
});

$("printButton").addEventListener("click", () => {
    if (getShoppingItems().length === 0) {
        showToast("Add meals before printing your shopping list.");
        return;
    }
    window.print();
});

$("copyListButton").addEventListener("click", async () => {
    const items = getShoppingItems();

    if (items.length === 0) {
        showToast("Your shopping list is empty.");
        return;
    }

    const text = "RecipeNest Shopping List\n\n" +
        items.map(item => `${checkedItems.includes(item) ? "[x]" : "[ ]"} ${item}`).join("\n");

    try {
        await navigator.clipboard.writeText(text);
        showToast("Shopping list copied!");
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        try {
            const copied = document.execCommand("copy");
            showToast(copied ? "Shopping list copied!" : "Copy failed. Please copy the list manually.");
        } catch {
            showToast("Copy failed. Please copy the list manually.");
        }

        textarea.remove();
    }
});

$("closeModal").addEventListener("click", closeModal);
$("recipeModal").addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
});

renderRecipeOptions();
refresh();
