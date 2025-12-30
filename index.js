const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// ================= SERVIDOR WEB (VITAL PARA RENDER 24/7) =================
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('✅ El bot de MACERGON está activo y vigilando 24/7.');
});

app.listen(port, () => {
    console.log(`🔗 Servidor web listo en puerto ${port}`);
});
// =========================================================================

const TOKEN = process.env.DISCORD_TOKEN; 
const CANAL_ID = 'TU_ID_DE_CANAL_AQUÍ'; // <--- ¡NO OLVIDES PONER LOS NÚMEROS DE TU CANAL!

// CONFIGURACIÓN DE TU CANAL
const MI_USUARIO = 'macergon';
const MENSAJE = '@everyone 🚨 **¡MACERGON ESTÁ EN VIVO!** \nCorran a verlo aquí: https://www.tiktok.com/@macergon/live';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

let yaAvisamos = false; // Memoria para no repetir el aviso

async function checkLive() {
    try {
        console.log(`🔎 Revisando si ${MI_USUARIO} está en directo...`);
        
        const url = `https://www.tiktok.com/@${MI_USUARIO}/live`;
        const response = await axios.get(url, {
            headers: {
                // Nos disfrazamos de navegador real para que TikTok no nos bloquee
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        const html = response.data;
        // Buscamos las señales de vida en el código de TikTok
        const estaEnVivo = html.includes('"status":2') || html.includes('room_id'); 

        if (estaEnVivo && !yaAvisamos) {
            // ¡ESTÁS EN VIVO!
            yaAvisamos = true;
            const channel = await client.channels.fetch(CANAL_ID);
            channel.send(MENSAJE);
            console.log('✅ ¡Notificación enviada con éxito!');

        } else if (!estaEnVivo && yaAvisamos) {
            // YA TERMINÓ EL DIRECTO
            yaAvisamos = false;
            console.log('⏹ El directo ha terminado.');
        } else {
            console.log('💤 Sin novedades (Offline).');
        }

    } catch (error) {
        console.error('❌ Error temporal al revisar TikTok:', error.message);
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot de ${MI_USUARIO} conectado y listo.`);
    
    checkLive(); // Revisar inmediatamente al encender
    setInterval(checkLive, 300000); // Revisar cada 5 minutos
});

client.login(TOKEN);