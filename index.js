const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express'); // Necesario para Render

// ================= SERVIDOR WEB (Para que Render no se apague) =================
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('¡El bot está vivo y vigilando TikTok!');
});

app.listen(port, () => {
    console.log(`🔗 Servidor web falso listo en el puerto ${port}`);
});
// ============================================================================

const TOKEN = process.env.DISCORD_TOKEN; 
const CANAL_ID = 'TU_ID_DE_CANAL_AQUÍ'; // <--- ¡NO OLVIDES PONER TU ID DE CANAL!

// TUS USUARIOS A VIGILAR
const USUARIOS_TIKTOK = [
    'macergon',
    'solokaosmx',
    'erosfutw' 
];

const MENSAJE = '@everyone 🚨 ¡CORRE! **NOMBRE** está en DIRECTO en TikTok. \nEntra ya: LINK';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

let estadosLive = {}; 

USUARIOS_TIKTOK.forEach(usuario => { estadosLive[usuario] = false; });

async function checkTikTokLive() {
    for (const usuario of USUARIOS_TIKTOK) {
        try {
            console.log(`🔎 Revisando a ${usuario}...`);
            const url = `https://www.tiktok.com/@${usuario}/live`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                }
            });

            const html = response.data;
            const isLive = html.includes('"status":2') || html.includes('room_id'); 

            if (isLive && !estadosLive[usuario]) {
                estadosLive[usuario] = true;
                const channel = await client.channels.fetch(CANAL_ID);
                const mensajeFinal = MENSAJE
                    .replace('NOMBRE', usuario)
                    .replace('LINK', `https://www.tiktok.com/@${usuario}/live`);
                channel.send(mensajeFinal);
            } else if (!isLive && estadosLive[usuario]) {
                estadosLive[usuario] = false;
            }
        } catch (error) {
            console.error(`❌ Error con ${usuario}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot conectado como ${client.user.tag}`);
    checkTikTokLive(); 
    setInterval(checkTikTokLive, 300000); 
});

client.login(TOKEN);