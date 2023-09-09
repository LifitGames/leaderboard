const config = {
    'Scale Feminino': ['T', 'R', 'R', 'C', 'T'],
    'Scale Misto': ['T', 'R', 'R', 'C', 'T'],
    'Scale Masculino': ['T', 'R', 'R', 'C', 'T'],
    'Amador Feminino': ['T', 'C', 'C', 'C', 'T'],
    'Amador Misto': ['T', 'C', 'C', 'C', 'T'],
    'Amador Masculino': ['T', 'C', 'C', 'C', 'T'],
    'RX Feminino': ['T', 'C', 'C', 'C', 'T'],
    'RX Misto': ['T', 'C', 'C', 'C', 'T'],
    'RX Masculino': ['T', 'C', 'C', 'C', 'T'],
}

addEventListener('DOMContentLoaded', async () => {
    const results = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQrLDqRf5JWbIRZayYltnZy8NnhAyEDsJNwcfjW87xYq5wkFqsFhP43tHJZcbYRwRiJowT2y3x18ICw/pub?gid=560338241&single=true&output=csv');

    const data = CSVToArray(await results.text()).slice(1);
    const categories = data
        .map((item) => item[0])
        .filter((item, index, array) => array.indexOf(item) === index);

    const categorySelector = document.createElement('div');
    categorySelector.classList.add('category-selector');
    categorySelector.innerHTML = `
        <img src="assets/logo.jpg" alt="LIFIT GAMES" class="logo">
        <label for="category" class="form-label">Categoria:</label>
        <select name="category" id="category" class="form-control">
            ${categories.map((category) => `<option value="${category}">${category}</option>`)}
        </select> 
    `;
    document.addEventListener('change', handleCategoryChange);

    document.getElementById('root').innerHTML = categorySelector.outerHTML;

    const resultsByCategory = {};
    data.forEach((item) => {
        const [category, team, workout_1, workout_2_1, workout_2_2, workout_2_3, workout_3, , points_1, points_2_1, points_2_2, points_2_3, points_3, pointsTotal, position] = item;

        if (!resultsByCategory[category]) {
            resultsByCategory[category] = [];
        }

        resultsByCategory[category].push({
            team,
            workouts: [
                workout_1,
                workout_2_1,
                workout_2_2,
                workout_2_3,
                workout_3,
            ],
            points: [
                points_1,
                points_2_1,
                points_2_2,
                points_2_3,
                points_3,
            ],
            pointsTotal,
            position,
        });
    });

    categories.map((category, index) => {
        resultsByCategory[category].sort((a, b) => {
            if (a.position > b.position) {
                return 1;
            }

            if (a.position < b.position) {
                return -1;
            }

            if (a.workouts[4] > b.workouts[4]) {
                return 1;
            }

            if (a.workouts[4] < b.workouts[4]) {
                return -1;
            }

            if (a.workouts[0] > b.workouts[0]) {
                return 1;
            }

            if (a.workouts[0] < b.workouts[0]) {
                return -1;
            }

            return 0
        });

        const table = document.createElement('table');
        table.classList.add('table', 'table-striped');
        if (index === 0) {
            table.classList.add('active');
        }
        table.setAttribute('data-toggle', 'table');
        table.setAttribute('data-category', category);
        table.innerHTML = `
            <thead>
                <tr>
                    <th data-field="position">&nbsp;</th>
                    <th data-field="team">Time</th>
                    <th data-field="workout-1">Prova 1</th>
                    <th data-field="workout-2-1">Prova 2.1</th>
                    <th data-field="workout-2-2">Prova 2.2</th>
                    <th data-field="workout-2-3">Prova 2.3</th>
                    <th data-field="workout-3">Prova 3</th>
                </tr>
            </thead>
            <tbody>
                ${resultsByCategory[category].map((item, index) => {
            return `
                        <tr>
                            <td class="positionColumn">${index + 1} <span>(${item.pointsTotal})</span></td>
                            <td class="teamColumn">${item.team}</td>
                            ${item.workouts.map((result, index) => {
                return `
                                    <td class="workoutColumn">${formatWorkout(category, index, result, item.points[index])} </td>
                                `;
            }).join('')}
                        </tr>
                    `;
        }).join('')}
            </tbody>
        `;
        document.getElementById('root').innerHTML += `<div class="table-responsive">${table.outerHTML}</div>`;
    });
});

function handleCategoryChange(event) {
    const target = event.target.value;
    const tables = document.querySelectorAll('table');
    tables.forEach((table) => {
        if (table.getAttribute('data-category') === target) {
            table.classList.add('active');
        } else {
            table.classList.remove('active');
        }
    });
}

function formatWorkout(category, workout, result, points) {
    if (points === '0') {
        return '-';
    }

    let formattedResult = '';
    const format = config[category][workout];

    if (format === 'T') {
        formattedResult = formatTime(result);
    } else if (format === 'R') {
        formattedResult = `${result} reps`;
    } else if (format === 'C') {
        formattedResult = `${result} kg`;
    }

    return `${formattedResult} <span>(${points})</span>`;
}

function formatTime(time) {
    // Convert the input to a string to manipulate it more easily
    let timeStr = String(time);

    // Add leading zeros until the string length is 6
    while (timeStr.length < 6) {
        timeStr = "0" + timeStr;
    }

    // Extract hours, minutes, and seconds
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    const seconds = timeStr.substring(4, 6);

    // Construct the formatted time string
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime;
}

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}
