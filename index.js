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

if (!TOKEN) {
  console.error("❌ DISCORD_TOKEN não definido.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ DISCORD_CLIENT_ID não definido.");
  process.exit(1);
}

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
    .setDescription(
  "# 📌 Bem-vindo ao painel oficial da 🔥 𝙎𝙣𝙞𝙥𝙚𝙭ˢᶜʳⁱᵖᵗ ᵖᵃⁿᵉˡ 👻\n\n" +

  "━━━━━━━━━━━━━━━━━━\n\n" +

  "⚙️ Gerencie seu acesso utilizando os botões abaixo:\n\n" +

  "🔑 • Resgatar Key\n" +
  "> Ative sua licença utilizando sua key exclusiva.\n\n" +

  "📜 • Obter Script\n" +
  "> Libera o script após a ativação da licença.\n\n" +

  "👤 • Receber Cargo\n" +
  "> Ganha automaticamente o cargo no servidor.\n\n" +

  "⚙️ • Resetar HWID\n" +
  "> Utilize caso troque de PC ou executor.\n\n" +

  "━━━━━━━━━━━━━━━━━━\n\n" +

  "⚠️ Informações Importantes:\n" +
  "• Mantenha sua key privada.\n" +
  "• Não compartilhe seu acesso.\n" +
  "• Compartilhamento não autorizado resultará na remoção da licença."
)
    .setColor(0xb300ff)
    .setFooter({ text: "Snipex System • Secure Access" })
    .setImage(
      "https://cdn.discordapp.com/attachments/1381714599442649138/1490162386122965042/file_000000008870720e9825f146362ee8a53.png?ex=69d3b61e&is=69d2649e&hm=fddf6cbd14cea8a73039f4c5683c5e0bfff57d5c5fee4b498d0c10454eb079bf&",
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

    if (interaction.isChatInputCommand() && interaction.commandName === "setup") {

  if (interaction.user.id !== "1030955815114391592") {
    return await interaction.reply({
      content: "❌ You are not allowed to use this command.",
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const { embed, row } = buildPanel();

  await interaction.channel.send({
    embeds: [embed],
    components: [row],
  });

  return await interaction.editReply({
    content: "✅ Painel enviado!",
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
          ephemeral: true,
        });
      }

      // Verifica se a key já foi usada por outro usuário
      if (keys[keyDigitada].used && keys[keyDigitada].user !== userId) {
        return await interaction.reply({
          content: "❌ **Key já utilizada** por outro usuário.",
          ephemeral: true,
        });
      }

      // Verifica se esse usuário já tem uma key ativa
      if (users[userId]) {
        return await interaction.reply({
          content: "⚠️ Você já possui uma **key ativa**.",
          ephemeral: true,
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
        ephemeral: true,
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
          ephemeral: true,
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
        ephemeral: true,
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
          ephemeral: true,
        });
      }

      // Verifica se ROLE_ID foi configurado
      if (ROLE_ID === "SEU_ROLE_ID_AQUI") {
        return await interaction.reply({
          content:
            "⚙️ O administrador ainda não configurou o **ROLE_ID** no bot.",
          ephemeral: true,
        });
      }

      try {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        await member.roles.add(ROLE_ID);
        await interaction.reply({
          content: "👤 **Cargo entregue com sucesso!**",
          ephemeral: true,
        });
      } catch (err) {
        console.error("Erro ao dar cargo:", err);
        await interaction.reply({
          content:
            "❌ Não consegui dar o cargo. Verifique se o bot tem permissão de **Gerenciar Cargos** e se o cargo está abaixo do bot na hierarquia.",
          ephemeral: true,
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
          ephemeral: true,
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
          ephemeral: true,
        });
      }

      // Verifica cooldown de 7 dias
      if (user.lastReset && now - user.lastReset < SEVEN_DAYS) {
        const disponivelEm = new Date(user.lastReset + SEVEN_DAYS);
        const dias = Math.ceil((disponivelEm - now) / (24 * 60 * 60 * 1000));
        return await interaction.reply({
          content: `⏳ Você precisa aguardar **${dias} dia(s)** para resetar novamente.`,
          ephemeral: true,
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
        ephemeral: true,
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
const PORT = process.env.PORT || 3000;
const app = express();

app.get("/ping", (req, res) => res.status(200).send("PONG"));
app.get("/", (req, res) => res.status(200).send("Bot is online"));

app.listen(PORT, () => {
  console.log(`🌐 Web rodando na porta ${PORT}`);

  // Auto-ping interno a cada 5 segundos
});

// ─────────────────────────────────────────────
//   LOGIN
// ─────────────────────────────────────────────
client.login(TOKEN);
