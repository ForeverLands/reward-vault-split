import Prando from 'prando';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const VAULT_NAMES = {
    "Unexplored Resources": "Artifact",
    "Magnesium": "Enosys",
    "Kolectivium": "Kolectiv",
    "Rare Earth": "Rarible",
    "Monolithium": "SuperRare",
    "Photonium": "Sloika",
    "Pangeum": "PangeaDAO",
    "Niftyum": "NiftyGateway"
}

const OUTPUT_FOLDER = './vaults/';

const input = fs.readFileSync('vault.csv', 'utf8');
const vault = parse(input, {
    columns: false,
    skip_empty_lines: true,
    fromLine: 2
});

// Difficulty from block #16161616: https://etherscan.io/block/16161616
let rng = new Prando(58750003716598352816469);
let distributed = [[],[],[],[],[],[],[],[]];

// apply deterministic sorting to the vault
function rng_sort(a, b) {
    return 0.5 - rng.next(0, 1);
}
let sorted = vault.sort(rng_sort);

// split the sorted vault into 8 equal(-ish) parts
for (let i = 0; i < sorted.length; i++) {
    const element = sorted[i];
    const target_vault = i % distributed.length;
    distributed[target_vault].push(element);
}

// apply deterministic sort on the resulting vaults to remove the favor duo to sequence
distributed = distributed.sort(rng_sort);

// ensure the output folder exists
fs.mkdirSync(`${OUTPUT_FOLDER}`, { recursive: true });

// output the result as json
const resource_name_values = Object.keys(VAULT_NAMES);
const vault_name_values = Object.values(VAULT_NAMES);

for (let x = 0; x < vault_name_values.length; x++) {
    const vault_name = vault_name_values[x];
    const resource_name = resource_name_values[x];

    const vault_json = JSON.stringify({
        vault: vault_name,
        resource: resource_name,
        items: distributed[x],
        count: distributed[x].length
    }, null, 2);

    fs.writeFileSync(`${OUTPUT_FOLDER}${vault_name}.json`, vault_json);
}