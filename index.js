const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// ================= CONFIGURACIÓN =================
// IMPORTANTE: El token lo toma de las variables de Render/Square Cloud
const TOKEN = process.env.DISCORD_TOKEN; 

const CANAL_ID = '1452792758069624934'; 

// AQUI PON TU LISTA DE USUARIOS (Entre comillas y separados por coma)
const USUARIOS_TIKTOK = [
    'macergon',
    'solokaosmx',
    'erosfutw' 
];

const MENSAJE = '@everyone 🚨 ¡CORRAAAAAN! **NOMBRE** está en DIRECTO en estos momentos por TikTok. \nEntra ya: LINK';
// =================================================

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// MEMORIA: Aquí guardaremos el estado de cada usuario para no repetir avisos
let estadosLive = {}; 

// Inicializamos la memoria en falso para todos
USUARIOS_TIKTOK.forEach(usuario => {
    estadosLive[usuario] = false;
});

async function checkTikTokLive() {
    // Recorremos la lista de usuarios uno por uno
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

            // LÓGICA DE NOTIFICACIÓN
            if (isLive && !estadosLive[usuario]) {
                // Si está en vivo y NO habíamos avisado
                estadosLive[usuario] = true; // Marcamos como avisado
                
                const channel = await client.channels.fetch(CANAL_ID);
                const mensajeFinal = MENSAJE
                    .replace('NOMBRE', usuario)
                    .replace('LINK', `https://www.tiktok.com/@${usuario}/live`);

                channel.send(mensajeFinal);
                console.log(`✅ Notificación enviada para ${usuario}.`);

            } else if (!isLive && estadosLive[usuario]) {
                // Si ya se apagó el directo
                estadosLive[usuario] = false; // Reseteamos para la próxima
                console.log(`⏹ El directo de ${usuario} terminó.`);
            }

        } catch (error) {
            console.error(`❌ Error al revisar a ${usuario}:`, error.message);
        }
        
        // Esperamos 2 segundos entre cada usuario para que TikTok no bloquee al bot
        await new Promise(r => setTimeout(r, 2000));
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot conectado como ${client.user.tag}`);
    checkTikTokLive(); 
    setInterval(checkTikTokLive, 300000); // Revisa cada 5 minutos
});

client.login(TOKEN);