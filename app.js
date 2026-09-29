import { MainMenu } from './src/commands/MainMenu.js';


async function main() {
    const menu = new MainMenu();
    await menu.iniciar();
}

main().catch(err => {
    console.error('Error fatal en la aplicación:', err);
    process.exit(1);
});