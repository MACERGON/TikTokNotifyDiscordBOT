const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// ================= CONFIGURACIÓN (EDITA ESTO) =================
const TOKEN = process.env.DISCORD_TOKEN;
const CANAL_ID = '1452792758069624934'; 
const USUARIO_TIKTOK = 'solokaosmx'; // Ej: ibai, auronplay
const MENSAJE = '@everyone 🚨 ¡CORRE! **NOMBRE** está en DIRECTO en TikTok. \nEntra ya: LINK';
// ==============================================================

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Variable para recordar si ya avisamos (para no spamear)
let enDirecto = false;

async function checkTikTokLive() {
    try {
        console.log(`🔎 Revisando estado de ${USUARIO_TIKTOK}...`);
        
        // Usamos una URL especial de TikTok que a veces devuelve datos JSON
        // Nota: TikTok cambia esto a menudo, usamos un User-Agent para parecer un navegador real
        const url = `https://www.tiktok.com/@${USUARIO_TIKTOK}/live`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        const html = response.data;

        // Buscamos pistas en el código de la página que indiquen "LIVE"
        // "room_id" suele aparecer cuando hay una sala activa o status:2
        // El método más fiable casero es buscar la etiqueta de estado en los metadatos
        const isLive = html.includes('"status":2') || html.includes('room_id'); 

        if (isLive && !enDirecto) {
            // Si está en vivo y NO habíamos avisado antes
            enDirecto = true;
            const channel = await client.channels.fetch(CANAL_ID);
            
            // Reemplazamos las palabras clave del mensaje
            const mensajeFinal = MENSAJE
                .replace('NOMBRE', USUARIO_TIKTOK)
                .replace('LINK', `https://www.tiktok.com/@${USUARIO_TIKTOK}/live`);

            channel.send(mensajeFinal);
            console.log('✅ Notificación enviada.');

        } else if (!isLive && enDirecto) {
            // Si ya no está en vivo, reseteamos para el próximo directo
            enDirecto = false;
            console.log('⏹ El directo ha terminado.');
        } else {
            console.log('💤 No está en directo (o sin cambios).');
        }

    } catch (error) {
        console.error('❌ Error al consultar TikTok (Posible bloqueo temporal):', error.message);
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot conectado como ${client.user.tag}`);
    
    // Revisar cada 5 minutos (300,000 ms)
    // NO bajes mucho este tiempo o TikTok bloqueará tu IP
    checkTikTokLive(); // Revisar al iniciar
    setInterval(checkTikTokLive, 300000); 
});

client.login(TOKEN);