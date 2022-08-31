// gobblegobble



// 1. get weather from location -----------------------------------


// var to store location input element
var inputLoc = document.getElementById('locationInput');
// var to store food input element
var inputFood = document.getElementById('ingredientInput');

// func to check + retrieve value of input
function getLocation(writtenInBar) {
    // get location as [City, Country]
    // clear input bar
    console.log(writtenInBar.value);
    if (writtenInBar.value.length != 0) {
        var inputTextArray = writtenInBar.value.toLowerCase().replace(/\s/g, '+').split(',').filter(entry => entry.trim() != '');
        console.log(inputTextArray);
        console.log(writtenInBar.value);
        return inputTextArray;
    // check if input is still empty
    } else {
        alert('*BAWK* You need to fill in your location first. *BAWK*');
    };
};


function getFood(foods) {
    var inputTextStr = foods.value.toLowerCase().trim().replace(/\s/g, '+');
    console.log(inputTextStr);
    console.log(foods.value);
    return inputTextStr;
} ;


function tempCuis() {
    var temp = parseFloat(document.getElementById('temp').innerHTML.split('°')[0]);
    var cuisine = '';
    // -40 - +40 --> (-40 - -20 = soup), (-20 - 0 = breakfast), (0 - 5 = bread), (5 - 10 = dessert), (10 - 20 = main course), (20 - 30 = salad), (30 - 40 = snack)
    if (temp <= -20) {
        cuisine = 'eastern+european,british,european';
    } else if (-20 < temp && temp <= 0) {
        cuisine = 'french,german';
    } else if (0 < temp && temp <= 5) {
        cuisine = 'indian,mexican';
    } else if (5 < temp && temp <= 10) {
        cuisine = 'african,cajun,spanish';
    } else if (10 < temp && temp <= 20) {
        cuisine = 'meditterranean,greek,caribbean,italian';
    } else if (20 < temp && temp <= 30) {
        cuisine = 'japanese,chinese,korean,vietnamese,thai';
    } else if (30 < temp) {
        cuisine = 'middle+eastern';
    };
    return cuisine;
};

function getIDS(data) {
    var typeIDS = [];
    for (var recipeNum in data) {
        // get IDS
        typeIDS.push(data[recipeNum]['id']);
    };
    return typeIDS;
}

// get place, temp, descript of weather
async function getWeather(place) {
    var apiKey = '3b6f39706cf7b430da62c0d38e1adc89'
    var fullWeatherRaw = await fetch('https://api.openweathermap.org/data/2.5/weather?q='
        +place[0]
        +'&units=metric&appid='
        +apiKey);
    if (fullWeatherRaw.ok) {
        var fullWeatherReadable = await fullWeatherRaw.json();
        document.getElementById('place').innerHTML = fullWeatherReadable['name'];
        document.getElementById('temp').innerHTML = fullWeatherReadable['main']['temp'] + ' °C';
        document.getElementById('descript').innerHTML = fullWeatherReadable['weather'][0]['description'];
        var weatherNeeded = [fullWeatherReadable['name'], fullWeatherReadable['main']['temp'] + ' °C', fullWeatherReadable['weather'][0]['description']];  // delete if not used
        inputLoc.disabled = true;
        inputFood.disabled = false;
    } else if (fullWeatherRaw.status === 404) {
        inputLoc.value = '';
        alert('*BAWK* City unknown, try again. *BAWK*');
        Promise.reject('error 404');
    };
};


async function getRecipes(food, cuisine) {
    var recipesRaw = await fetch(
        'https://api.spoonacular.com/recipes/complexSearch?'
        +'cuisine='
        +cuisine
        +'&instructionsRequired=true'
        +'&number=900'
        +'&apiKey='
        +'c52df03da29e45e589c65c0dd0ff548b'
    );

    var recipesbyIngredient = await recipesRaw.json();
    console.log(recipesbyIngredient);
    
    if (recipesbyIngredient['number'] >= 1) {
        var typeIDS = getIDS(recipesbyIngredient['results']);
        var finalRecipeIDS = await getRecipesB(typeIDS, food);
    } else {
        inputFood.value = '';
        alert('*BAWK* Nothing good comes from that search. Try a different ingredient. *BAWK*');
    };


    if (Object.keys(finalRecipeIDS).length < 1) {
        inputFood.value = '';
        alert('*BAWK* Nothing good comes from that search. Try a different ingredient. *BAWK*');
    } else {
        inputFood.disabled = true;
        document.getElementById('place').style = 'display: block;';
        document.getElementById('temp').style = 'display: block;';
        document.getElementById('descript').style = 'display: block;';
        for (var [key, value] of Object.entries(finalRecipeIDS)) {
            // create title class
            var foodName = document.createElement('div');
            foodName.className = 'foodName';
            foodName.style = 'display: none;'
            document.body.appendChild(foodName);
            foodName.innerHTML = finalRecipeIDS[key][0];
            // create ingredients class
            var foodPic = document.createElement('img');
            foodPic.className = 'foodPic';
            foodPic.style = 'display: none;'
            foodPic.src = finalRecipeIDS[key][1];
            // create link to recipe
            var foodLink = document.createElement('a');
            foodLink.href = await linkToInstruct(key);
            foodLink.target = "_blank";
            foodLink.appendChild(foodPic);
            document.body.appendChild(foodLink);
        };
        foodName.style = 'display: block;';
        foodPic.style = 'display: block;';
        window.scroll(0, document.body.scrollHeight);
    };
};


async function getRecipesB(foodIds, food) {
    var recipesRaw = await fetch(
        'https://api.spoonacular.com/recipes/findByIngredients?ingredients='
        +food
        +'&instructionsRequired=true'
        +'&number=900'
        +'&apiKey='
        +'c52df03da29e45e589c65c0dd0ff548b'
    );

    var recipesbyIngredient = await recipesRaw.json();
    var finalRecipeIDS = {};
    console.log(recipesbyIngredient);
    for (var x in recipesbyIngredient) {
        var namePic = [];
        if (foodIds.includes(recipesbyIngredient[x]['id'])) {
            namePic.push(recipesbyIngredient[x]['title']);
            namePic.push(recipesbyIngredient[x]['image']);
            finalRecipeIDS[recipesbyIngredient[x]['id']] = namePic;
        };
        };
    return finalRecipeIDS;
};
    

async function linkToInstruct(key) {
    console.log(String(key));
    var recipeInfoRaw = await fetch(
        "https://api.spoonacular.com/recipes/"
        +String(key)
        +"/information?"
        +"apiKey=c52df03da29e45e589c65c0dd0ff548b"
    );

    recipeInfo = await recipeInfoRaw.json();
    console.log(recipeInfo["sourceUrl"]);
    return recipeInfo["sourceUrl"];
}



inputLoc.addEventListener('keypress', function enterInput(e) {
    if (e.key === 'Enter') {

        var locationArray = getLocation(inputLoc);
        if (locationArray != null) {
            getWeather(locationArray)
                .then(fullWeatherReadable => {
                    console.log(document.getElementById('place').innerHTML, document.getElementById('temp').innerHTML, document.getElementById('descript').innerHTML);
                })
                .catch( error => {
                    alert('*BAWK* Something went wrong. Try again. *BAWK*');
                    console.log('error is ', error);
                });
        }
    };
});


inputFood.addEventListener('keypress', function enterInput(e) {
    if (e.key == 'Enter') {
        cuisine = tempCuis();
        console.log(cuisine);
        if (inputFood.disabled === false) {
            var foodStr = getFood(inputFood);
            if (foodStr.length == 0) {
                alert('*BAWK* Tell me an ingredient first. *BAWK*')
            } else {
                getRecipes(foodStr, cuisine)
                .catch( error => {
                    alert('*BAWK* Something went wrong. Try again. *BAWK*');
                    console.log('error is ', error);
                });
            }
        }
    }
})