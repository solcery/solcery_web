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