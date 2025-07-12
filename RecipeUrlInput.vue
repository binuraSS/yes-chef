<template>
    <div class="p-4 max-w-xl mx-auto text-center">
        <h2 class="text-xl font-bold mb-4">Import Recipe from Website</h2>
        <input v-model="url" placeholder="Paste a recipe URL" class="border p-2 w-full rounded mb-2" />
        <button @click="scrapeRecipe" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Scrape Recipe
        </button>

        <p v-if="loading" class="text-sm mt-2">Scraping recipe...</p>
        <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </div>
</template>

<script>
export default {
    name: "RecipeUrlInput",
    data() {
        return {
            url: "",
            loading: false,
            error: null,
            showShoppingList: false,
            shoppingList: []
        };
    },
    methods: {
        async scrapeRecipe() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch("http://localhost:5000/api/scrape", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: this.url }),
                });

                const data = await response.json();

                if (data.error) {
                    this.error = data.error;
                } else {
                    this.$emit("scraped", data); // Send data to parent
                }
            } catch (err) {
                this.error = "Something went wrong.";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
  
