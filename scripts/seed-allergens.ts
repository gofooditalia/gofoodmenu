import { db } from './src/lib/db';
import { allergens } from './src/lib/db/schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Seeding allergens...');
    const data = [
        { id: 'glutine', number: 1, icon: '🌾', name: 'Glutine', description: 'Cereali contenenti glutine: grano, segale, orzo, avena, farro, kamut.' },
        { id: 'crostacei', number: 2, icon: '🦐', name: 'Crostacei', description: 'Crostacei e prodotti a base di crostacei.' },
        { id: 'uova', number: 3, icon: '🥚', name: 'Uova', description: 'Uova e prodotti a base di uova.' },
        { id: 'pesce', number: 4, icon: '🐟', name: 'Pesce', description: 'Pesce e prodotti a base di pesce.' },
        { id: 'arachidi', number: 5, icon: '🥜', name: 'Arachidi', description: 'Arachidi e prodotti a base di arachidi.' },
        { id: 'soia', number: 6, icon: '🫘', name: 'Soia', description: 'Soia e prodotti a base di soia.' },
        { id: 'latte', number: 7, icon: '🥛', name: 'Latte', description: 'Latte e prodotti a base di latte (compreso il lattosio).' },
        { id: 'frutta-guscio', number: 8, icon: '🌰', name: 'Frutta a guscio', description: 'Mandorle, nocciole, noci, anacardi, pistacchi.' },
        { id: 'sedano', number: 9, icon: '🌿', name: 'Sedano', description: 'Sedano e prodotti a base di sedano.' },
        { id: 'senape', number: 10, icon: '🍯', name: 'Senape', description: 'Senape e prodotti a base di senape.' },
        { id: 'sesamo', number: 11, icon: '🥯', name: 'Sesamo', description: 'Semi di sesamo e prodotti a base di semi di sesamo.' },
        { id: 'anidride-solforosa', number: 12, icon: '🍷', name: 'Solfiti', description: 'Anidride solforosa e solfiti in concentrazioni superiori a 10 mg/kg o 10 mg/litro.' },
        { id: 'lupini', number: 13, icon: '🌼', name: 'Lupini', description: 'Lupini e prodotti a base di lupini.' },
        { id: 'molluschi', number: 14, icon: '🐚', name: 'Molluschi', description: 'Molluschi e prodotti a base di molluschi.' },
    ];

    try {
        for (const item of data) {
            await db.insert(allergens).values(item).onConflictDoUpdate({
                target: allergens.id,
                set: {
                    number: item.number,
                    icon: item.icon,
                    name: item.name,
                    description: item.description
                }
            });
        }
        console.log('Allergens seeded successfully.');
    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        process.exit(0);
    }
}

main();
