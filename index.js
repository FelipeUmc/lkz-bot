// =============================================
//   LKZ LICENSE BOT — Sistema de Licenciamento
//   discord.js | Node.js | JSON como banco
// =============================================

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const express = require("express");

// ─────────────────────────────────────────────
//   ANTI-CRASH — evita que o processo encerre
// ─────────────────────────────────────────────
process.on("uncaughtException", (err) => console.error("🔴 CRASH:", err));
process.on("unhandledRejection", (err) =>
  console.error("🔴 PROMISE ERROR:", err),
);

// ─────────────────────────────────────────────
//   CONFIGURAÇÕES
// ─────────────────────────────────────────────
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = "1301022858599989268";
const ROLE_ID = "1479659415576776967";

const KEYS_FILE = "./keys.json";
const USERS_FILE = "./users.json";

// ─────────────────────────────────────────────
//   HELPERS — JSON
// ─────────────────────────────────────────────
function loadJSON(file, defaultValue) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadKeys() {
  return loadJSON(KEYS_FILE, {});
}
function saveKeys(d) {
  saveJSON(KEYS_FILE, d);
}

function loadUsers() {
  return loadJSON(USERS_FILE, {});
}
function saveUsers(d) {
  saveJSON(USERS_FILE, d);
}

// ─────────────────────────────────────────────
//   HELPERS — HWID
// ─────────────────────────────────────────────
function generateHWID() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hwid = "HWID-";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) hwid += "-";
    hwid += chars[Math.floor(Math.random() * chars.length)];
  }
  return hwid;
}

// ─────────────────────────────────────────────
//   HELPER — PAINEL (embed + botões reutilizáveis)
// ─────────────────────────────────────────────
function buildPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🔥 𝙎𝙣𝙞𝙥𝙚𝙭ᵏᵉʸˢ 👻")
    .setDescription(
      "𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝙩𝙝𝙚 🔥 𝙎𝙣𝙞𝙥𝙚𝙭ˢᶜʳⁱᵖᵗ ᵖᵃⁿᵉˡ 👻.\n\n" +
        "𝙐𝙨𝙚 𝙩𝙝𝙚 𝙗𝙪𝙩𝙩𝙤𝙣𝙨 𝙗𝙚𝙡𝙤𝙬 𝙩𝙤 𝙢𝙖𝙣𝙖𝙜𝙚 𝙮𝙤𝙪𝙧 𝙖𝙘𝙘𝙚𝙨𝙨:\n" +
        "• 𝙍𝙚𝙙𝙚𝙚𝙢 𝙮𝙤𝙪𝙧 𝙠𝙚𝙮 𝙩𝙤 𝙖𝙘𝙩𝙞𝙫𝙖𝙩𝙚 𝙮𝙤𝙪𝙧 𝙡𝙞𝙘𝙚𝙣𝙨𝙚\n" +
        "• 𝙂𝙚𝙩 𝙮𝙤𝙪𝙧 𝙨𝙘𝙧𝙞𝙥𝙩 𝙖𝙛𝙩𝙚𝙧 𝙖𝙘𝙩𝙞𝙫𝙖𝙩𝙞𝙤𝙣\n" +
        "• 𝘾𝙡𝙖𝙞𝙢 𝙮𝙤𝙪𝙧 𝙧𝙤𝙡𝙚 𝙞𝙣 𝙩𝙝𝙚 𝙨𝙚𝙧𝙫𝙚𝙧\n" +
        "• 𝙍𝙚𝙨𝙚𝙩 𝙮𝙤𝙪𝙧 𝙃𝙒𝙄𝘿 𝙞𝙛 𝙣𝙚𝙚𝙙𝙚𝙙\n\n" +
        "𝙈𝙖𝙠𝙚 𝙨𝙪𝙧𝙚 𝙮𝙤𝙪𝙧 𝙠𝙚𝙮 𝙞𝙨 𝙫𝙖𝙡𝙞𝙙 𝙖𝙣𝙙 𝙠𝙚𝙚𝙥 𝙞𝙩 𝙥𝙧𝙞𝙫𝙖𝙩𝙚.\n" +
        "𝙐𝙣𝙖𝙪𝙩𝙝𝙤𝙧𝙞𝙯𝙚𝙙 𝙨𝙝𝙖𝙧𝙞𝙣𝙜 𝙢𝙖𝙮 𝙧𝙚𝙨𝙪𝙡𝙩 𝙞𝙣 𝙖𝙘𝙘𝙚𝙨𝙨 𝙧𝙚𝙢𝙤𝙫𝙖𝙡.",
    )
    .setColor(0xb300ff)
    .setFooter({ text: "Snipex System • Secure Access" })
    .setImage(
      "https://cdn.discordapp.com/attachments/1397767834536251512/1483987158384640190/file_000000008870720e9825f146362ee8a5.png",
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("redeem")
      .setLabel("🔑 Redeem Key")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("script")
      .setLabel("📜 Get Script")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("role")
      .setLabel("👤 Get Role")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("reset")
      .setLabel("⚙️ Reset HWID")
      .setStyle(ButtonStyle.Danger),
  );

  return { embed, row };
}

// ─────────────────────────────────────────────
//   CLIENT
// ─────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ─────────────────────────────────────────────
//   PRONTO
// ─────────────────────────────────────────────
client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot is online: ${client.user.tag}`);

  // Garante que os arquivos JSON existam
  loadKeys();
  loadUsers();

  // Registra comando instantâneo no servidor
  const commands = [
    new SlashCommandBuilder()
      .setName("setup")
      .setDescription(
        "Envia o painel permanente no canal (apenas administradores)",
      ),
  ].map((cmd) => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    // Remove comandos globais antigos que possam causar duplicata
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });

    // Registra somente no servidor (instantâneo, sem duplicata)
    console.log("🔄 Registrando comandos no servidor...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log(
      `✅ Comandos registrados instantaneamente no servidor ${GUILD_ID}!`,
    );
  } catch (err) {
    console.error("❌ Erro ao registrar comando:", err);
  }
});

// ─────────────────────────────────────────────
//   ERRO GERAL
// ─────────────────────────────────────────────
client.on("error", (err) => console.error("Erro no cliente:", err));

// ─────────────────────────────────────────────
//   INTERAÇÕES
// ─────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // ── SLASH COMMAND /setup ───────────────────
    if (interaction.isChatInputCommand()) {
      console.log(
        `📩 Comando recebido: /${interaction.commandName} — por ${interaction.user.tag}`,
      );
    }

    if (interaction.isButton()) {
      console.log(
        `🖱️ Botão clicado: ${interaction.customId} — por ${interaction.user.tag}`,
      );
    }

    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === "setup"
    ) {
      // Verifica se é o usuário autorizado
      if (interaction.user.id !== "1030955815114391592") {
        return await interaction.reply({
          content: "❌ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Envia o painel permanente no canal (visível para todos)
      const { embed, row } = buildPanel();
      await interaction.channel.send({ embeds: [embed], components: [row] });

      // Confirma para o admin (só ele vê)
      await interaction.reply({
        content: "✅ Panel sent successfully!",
        flags: MessageFlags.Ephemeral,
      });
    }

    // ── BOTÃO: Redeem Key → abre Modal ─────────
    if (interaction.isButton() && interaction.customId === "redeem") {
      const modal = new ModalBuilder()
        .setCustomId("modal_redeem")
        .setTitle("🔑 Resgatar Key");

      const keyInput = new TextInputBuilder()
        .setCustomId("key_input")
        .setLabel("Digite sua Key:")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("KEY-XXXXXXXX-XXXX-XXXX")
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
      await interaction.showModal(modal);
    }

    // ── MODAL SUBMIT: processar Redeem ──────────
    if (
      interaction.isModalSubmit() &&
      interaction.customId === "modal_redeem"
    ) {
      const keyDigitada = interaction.fields
        .getTextInputValue("key_input")
        .trim()
        .toUpperCase();
      const userId = interaction.user.id;

      const keys = loadKeys();
      const users = loadUsers();

      // Verifica se a key existe
      if (!keys[keyDigitada]) {
        return await interaction.reply({
          content: "❌ **Key inválida.** Essa key não existe.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Verifica se a key já foi usada por outro usuário
      if (keys[keyDigitada].used && keys[keyDigitada].user !== userId) {
        return await interaction.reply({
          content: "❌ **Key já utilizada** por outro usuário.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Verifica se esse usuário já tem uma key ativa
      if (users[userId]) {
        return await interaction.reply({
          content: "⚠️ Você já possui uma **key ativa**.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Resgata a key
      keys[keyDigitada].used = true;
      keys[keyDigitada].user = userId;
      saveKeys(keys);

      users[userId] = {
        discord_id: userId,
        key: keyDigitada,
        hwid: null,
        resets: 2,
        lastReset: null,
        resetMonthTime: Date.now(),
      };
      saveUsers(users);

      await interaction.reply({
        content: `✅ **Key resgatada com sucesso!**\n\`${keyDigitada}\`\n\nAgora você pode usar 📜 Get Script e 👤 Get Role.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // ── BOTÃO: Get Script ───────────────────────
    if (interaction.isButton() && interaction.customId === "script") {
      const userId = interaction.user.id;
      const users = loadUsers();

      if (!users[userId]) {
        return await interaction.reply({
          content:
            "❌ Você **não possui uma key ativa**. Use 🔑 Redeem Key primeiro.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Gera HWID se ainda não tiver
      if (!users[userId].hwid) {
        users[userId].hwid = generateHWID();
        saveUsers(users);
      }

      const hwid = users[userId].hwid;

      await interaction.reply({
        content: [
          "📜 **Seu Script:**",
          "```lua",
          `loadstring(game:HttpGet("https://seusite.com/script?hwid=${hwid}"))()`,
          "```",
          `🔒 HWID vinculado: \`${hwid}\``,
        ].join("\n"),
        flags: MessageFlags.Ephemeral,
      });
    }

    // ── BOTÃO: Get Role ─────────────────────────
    if (interaction.isButton() && interaction.customId === "role") {
      const userId = interaction.user.id;
      const users = loadUsers();

      if (!users[userId]) {
        return await interaction.reply({
          content:
            "❌ Você **não possui uma key ativa**. Use 🔑 Redeem Key primeiro.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Verifica se ROLE_ID foi configurado
      if (ROLE_ID === "SEU_ROLE_ID_AQUI") {
        return await interaction.reply({
          content:
            "⚙️ O administrador ainda não configurou o **ROLE_ID** no bot.",
          flags: MessageFlags.Ephemeral,
        });
      }

      try {
        const member = interaction.member;
        await member.roles.add(ROLE_ID);
        await interaction.reply({
          content: "👤 **Cargo entregue com sucesso!**",
          flags: MessageFlags.Ephemeral,
        });
      } catch (err) {
        console.error("Erro ao dar cargo:", err);
        await interaction.reply({
          content:
            "❌ Não consegui dar o cargo. Verifique se o bot tem permissão de **Gerenciar Cargos** e se o cargo está abaixo do bot na hierarquia.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    // ── BOTÃO: Reset HWID ───────────────────────
    if (interaction.isButton() && interaction.customId === "reset") {
      const userId = interaction.user.id;
      const users = loadUsers();

      if (!users[userId]) {
        return await interaction.reply({
          content:
            "❌ Você **não possui uma key ativa**. Use 🔑 Redeem Key primeiro.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const user = users[userId];
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      // Renovação mensal: se passaram 30 dias desde o último ciclo, restaura 2 resets
      if (!user.resetMonthTime || now - user.resetMonthTime >= THIRTY_DAYS) {
        user.resets = 2;
        user.resetMonthTime = now;
        user.lastReset = null;
      }

      // Verifica resets disponíveis
      if (user.resets <= 0) {
        return await interaction.reply({
          content: "❌ Você **não possui mais resets disponíveis** este mês.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Verifica cooldown de 7 dias
      if (user.lastReset && now - user.lastReset < SEVEN_DAYS) {
        const disponivelEm = new Date(user.lastReset + SEVEN_DAYS);
        const dias = Math.ceil((disponivelEm - now) / (24 * 60 * 60 * 1000));
        return await interaction.reply({
          content: `⏳ Você precisa aguardar **${dias} dia(s)** para resetar novamente.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Executa o reset
      user.hwid = null;
      user.resets -= 1;
      user.lastReset = now;
      users[userId] = user;
      saveUsers(users);

      await interaction.reply({
        content: `✅ **HWID resetado com sucesso!**\nResets restantes este mês: \`${user.resets}\``,
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (err) {
    console.error(
      `❌ Erro na interação [${interaction?.customId || interaction?.commandName || "unknown"}]:`,
      err.message,
    );
  }
});

// ─────────────────────────────────────────────
//   RECONEXÃO — eventos de disconnect
// ─────────────────────────────────────────────
client.on("shardDisconnect", (event, id) => {
  console.warn(
    `⚠️ Shard ${id} desconectou (código ${event.code}). Reconectando...`,
  );
});

client.on("shardReconnecting", (id) => {
  console.log(`🔄 Shard ${id} reconectando...`);
});

client.on("shardResume", (id, replayed) => {
  console.log(`✅ Shard ${id} reconectou. Eventos reprocessados: ${replayed}`);
});

// ─────────────────────────────────────────────
//   KEEP-ALIVE — HTTP server interno (porta 8080)
// ─────────────────────────────────────────────
const KEEP_ALIVE_PORT = 8080;
const app = express();

app.get("/ping", (req, res) => res.status(200).send("PONG"));
app.get("/", (req, res) => res.status(200).send("Bot is online"));

app.listen(KEEP_ALIVE_PORT, "0.0.0.0", () => {
  console.log(`🌐 Keep-alive HTTP rodando na porta ${KEEP_ALIVE_PORT}`);

  // Auto-ping interno a cada 5 segundos
  setInterval(async () => {
    try {
      await fetch(`http://localhost:${KEEP_ALIVE_PORT}/ping`);
    } catch (err) {
      console.error("❌ Auto-ping falhou:", err.message);
    }
  }, 5000);
});

// ─────────────────────────────────────────────
//   LOGIN
// ─────────────────────────────────────────────
client.login(TOKEN);