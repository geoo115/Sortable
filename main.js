let superheroes = [];
let filteredHeroes = [];
let currentPage = 1;
let pgSize = 20; // default
let sortColumn = 'name'; // Default
let sortAscending = true; // Default

const table = document.getElementById('data-table');
const searchBox = document.getElementById('searchBox');
const pgSizeSelector = document.getElementById('pgSize');

// Fetch data from the API
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
  .then(response => response.json())
  .then(data => {
    superheroes = data;
    sortData(); // Initial sort
    filteredHeroes = superheroes;
    renderTable();
  });

function renderTable() {
  // Clear existing table data
  table.innerHTML = '';

  // Create and append the header row
  const headerRow = document.createElement('tr');
  const headers = ["Img", "Name", "Full Name", "Intelligence", "Strength", "Speed", "Durability", "Power", "Combat", "Race", "Gender", "Height", "Weight", "Place of Birth", "Alignment"];
  
  headers.forEach(headerText => {
    const header = document.createElement('th');
    header.textContent = headerText;
  
    // Add click event listener for sorting
    header.addEventListener('click', () => {
      const newSortColumn = getSortKeyByHeader(headerText);
      // Toggle only if the same column is clicked again
      sortAscending = (sortColumn === newSortColumn) ? !sortAscending : true;
      sortColumn = newSortColumn; // Update the sort column
      sortData();
      renderTable();
    });
  
    headerRow.appendChild(header);
  });
  

  table.appendChild(headerRow);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pgSize;
  const endIndex = pgSize === 'all' ? filteredHeroes.length : startIndex + pgSize;
  const heroesToShow = filteredHeroes.slice(startIndex, endIndex);

  // Create and append rows to the table
  heroesToShow.forEach(hero => {
    const row = createTableRow(hero);
    table.appendChild(row);
  });
}

function createTableRow(hero) {
  const row = document.createElement('tr');

  // Image
  const iconCell = document.createElement('td');
  const iconImg = document.createElement('img');
  iconImg.src = hero.images.xs;
  iconImg.alt = hero.name;
  iconCell.appendChild(iconImg);
  row.appendChild(iconCell);
  row.appendChild(createCell(hero.name));
  row.appendChild(createCell(hero.biography.fullName));

  Object.values(hero.powerstats).forEach(stat => {
    row.appendChild(createCell(stat));
  });

  row.appendChild(createCell(hero.appearance.race));
  row.appendChild(createCell(hero.appearance.gender));
  // Metric Height
  row.appendChild(createCell(hero.appearance.height[1]));
  // Metric Weight
  row.appendChild(createCell(hero.appearance.weight[1]));
  row.appendChild(createCell(hero.biography.placeOfBirth));
  row.appendChild(createCell(hero.biography.alignment));

  return row;
}
// Create a table cell and append the value
function createCell(value) {
    const cell = document.createElement('td');
    // Check if value is null, undefined, or a dash, otherwise display the value
    cell.textContent = (value === null || value === undefined || value === '-') ? '' : value;
    return cell;
  }
  
  // Sort the data based on the sort column and sort order
  function sortData() {
    filteredHeroes.sort((a, b) => {
        let valueA = getValueForSort(a, sortColumn);
        let valueB = getValueForSort(b, sortColumn);
  
      // Check for missing values and placeholders to ensure they are sorted last
      if ((valueA === '-' || valueA === '' || valueA == null) && (valueB === '-' || valueB === '' || valueB == null)) return 0;
      if (valueA === '-' || valueA === '' || valueA == null) return 1;
      if (valueB === '-' || valueB === '' || valueB == null) return -1;
  
      // Perform sorting based on the data type
      if (sortColumn === 'placeOfBirth' || sortColumn === 'fullName') {
        // Normalize and sort strings, stripping out special characters and spaces
        valueA = valueA.replace(/[\(\)-]/g, '').trim().toLowerCase();
        valueB = valueB.replace(/[\(\)-]/g, '').trim().toLowerCase();
      }
  
      // Compare for sorting
      if (valueA < valueB) return sortAscending ? -1 : 1;
      if (valueA > valueB) return sortAscending ? 1 : -1;
      return 0;
    });
  }

  // Get the value for sorting based on the column
  function getValueForSort(hero, column) {
    switch (column) {
      case 'name':
        return hero.name;
      case 'fullName':
        return hero.biography.fullName;
      case 'intelligence':
        return hero.powerstats.intelligence;
      case 'strength':
        return hero.powerstats.strength;
      case 'speed':
        return hero.powerstats.speed;
      case 'durability':
        return hero.powerstats.durability;
      case 'power':
        return hero.powerstats.power;
      case 'combat':
        return hero.powerstats.combat;
      case 'race':
        return hero.appearance.race;
      case 'gender':
        return hero.appearance.gender;
      case 'height':
        return convertHeightToCm(hero.appearance.height);
      case 'weight':
        return convertWeightToKg(hero.appearance.weight);
      case 'placeOfBirth':
        return hero.biography.placeOfBirth;
      case 'alignment':
        return hero.biography.alignment;
      // Add cases for other columns as needed
      default:
        return null;
    }
  }

  function convertHeightToCm(heights) {
    if (!heights || heights.length < 2) {
      // If the heights array is missing or does not have at least two elements, return null
      return null;
    }
  
    const height = heights[1];
    if (!height) {
      // If the second element is missing, return null
      return null;
    }
  
    const heightLower = height.toLowerCase();
    const value = parseFloat(heightLower);
    if (isNaN(value)) {
      // If parsing fails, return null
      return null;
    }
    // check height is in cm or m
    if (heightLower.includes('cm')) {
      return value;
    } else if (heightLower.includes('m')) {
      // m to cm
      return value * 100;
    }
    // not metric height cm or m
    return null; 
  }

  function convertWeightToKg(weights) {
    // Try to convert the second value in the weight array first.
    // If it's in tons or lbs, convert it to kg. If it's already in kg, use it as is.
    let weight = weights.find(w => w.toLowerCase().includes('kg')) || 
                 weights.find(w => w.toLowerCase().includes('lb')) || 
                 weights.find(w => w.toLowerCase().includes('tons'));
  
    if (weight) {
      // Remove commas for proper conversion
      weight = weight.replace(/,/g, '');
      const weightLower = weight.toLowerCase();
      const value = parseFloat(weightLower);
      if (isNaN(value)) {
        return null; // If parsing fails, return null
      }
      // weight is in kg
      if (weightLower.includes('kg')) {
        return value;
      } else if (weightLower.includes('lb')) {
        // lbs to kg
        return value * 0.453592;
      } else if (weightLower.includes('tons')) {
        // tons to kg
        return value * 907.185;
      }
    }
    return null;
  }
  // Get the sort key for the column header
  function getSortKeyByHeader(headerText) {
    switch (headerText) {
      case "Name": return "name";
      case "Full Name": return "fullName";
      case "Intelligence": return "intelligence";
      case "Strength": return "strength";
      case "Speed": return "speed";
      case "Durability": return "durability";
      case "Power": return "power";
      case "Combat": return "combat";
      case "Race": return "race";
      case "Gender": return "gender";
      case "Height": return "height";
      case "Weight": return "weight";
      case "Place of Birth": return "placeOfBirth";
      case "Alignment": return "alignment";
      // Add mappings for other headers
      default: return null;
    }
  }
  // Event listeners for search box and page size selector
  searchBox.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filteredHeroes = superheroes.filter(hero => 
      hero.name.toLowerCase().includes(searchTerm)
    );
    sortData(); // Re-sort after filtering
    renderTable();
  });
  
  pgSizeSelector.addEventListener('change', (e) => {
    pgSize = e.target.value;
    currentPage = 1; // Reset to first page on page size change
    renderTable();
  });
