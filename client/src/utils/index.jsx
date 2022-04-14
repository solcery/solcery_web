export function insertTable(table, path, value) {
    path.reduce((acc, pathElement, idx) => {
        console.log(acc)
        if (idx < path.length -1) {
            // We're not at the final element of path, add a new object if necessary
            if (!acc[pathElement]) acc[pathElement] = {};
        } else {
            // We're at the last pathElement, set the value, e.g. 'slotter'
            acc[pathElement] = value;
        }
        return acc[pathElement];
    }, table)
}

export function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}