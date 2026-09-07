import { PrismaClient, Role } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function main() {
  // Clean any previous seed data so the script is re-runnable.
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.documentChunk.deleteMany({}).catch(() => {});
  await prisma.document.deleteMany({});
  await prisma.tool.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.chatbot.deleteMany({});
  await prisma.promptTemplate.deleteMany({});
  await prisma.user.deleteMany({});

  const user = await prisma.user.upsert({
    where: { email: "admin@wan.app" },
    update: {},
    create: {
      email: "admin@wan.app",
      name: "Wan Admin",
      role: Role.ADMIN,
    },
  });

  await prisma.promptTemplate.createMany({
    data: [
      {
        key: "chat.default",
        name: "Default Chat",
        content:
          "You are Wan, a helpful AI assistant. Answer clearly and concisely.",
        variables: "[]",
      },
      {
        key: "chat.rag",
        name: "RAG Chat",
        content:
          "You are Wan. Use the context provided between the <context> tags to answer the user's question. If you don't know, say so.",
        variables: '["context"]',
      },
      {
        key: "chat.system",
        name: "System Prompt",
        content: "You are a helpful AI assistant.",
        variables: "[]",
      },
    ],
    skipDuplicates: true,
  });

  const chatbot = await prisma.chatbot.create({
    data: {
      name: "Wan Assistant",
      description: "Assistant AI general de Wan",
      systemPrompt: "You are a helpful AI assistant named Wan.",
      model: "gpt-4o-mini",
      temperature: 0.7,
      isPublic: true,
      userId: user.id,
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      title: "Welcome to Wan",
      userId: user.id,
      chatbotId: chatbot.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "USER",
        content: "Bienvenido. ¿Quién eres?",
        tokens: 6,
      },
      {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content:
          "Hola. Soy Wan, tu asistente de IA. Estoy aquí para ayudarte.",
        tokens: 14,
      },
    ],
  });

  const document = await prisma.document.create({
    data: {
      title: "Acerca de Wan",
      content:
        "Wan es una plataforma de chat con IA que permite crear asistentes personalizados, conectar documentos (RAG) y gestionar conversaciones.",
      source: "seed",
      userId: user.id,
      chatbotId: chatbot.id,
    },
  });

  await prisma.$executeRaw`
    INSERT INTO "DocumentChunk" ("id", "documentId", "content", "chunkIndex", "embedding", "createdAt")
    VALUES (${createId()}, ${document.id}, ${"Wan es una plataforma de chat con IA que permite crear asistentes personalizados, conectar documentos (RAG) y gestionar conversaciones."}, 0, '[0.0]'::vector, NOW())
  `;

  const apiKey = await prisma.apiKey.create({
    data: {
      name: "Seed API Key",
      keyHash: "seed-key-hash-do-not-use",
      userId: user.id,
    },
  });

  const tool = await prisma.tool.create({
    data: {
      name: "web_search",
      description: "Busca información en la web",
      schemaJson: '{"type":"object","properties":{"query":{"type":"string"}}}',
      chatbotId: chatbot.id,
    },
  });

  console.log("Seed completado", {
    userId: user.id,
    chatbotId: chatbot.id,
    conversationId: conversation.id,
    documentId: document.id,
    apiKeyId: apiKey.id,
    toolId: tool.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });