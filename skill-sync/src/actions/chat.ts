'use server';

// NOTE: The current Prisma schema does not yet define a Message model.
// This file provides the intended server action signatures and throws
// until the Message model is added to the schema and migrated.

export async function sendMessage() {
  throw new Error(
    "sendMessage is not implemented yet. Add a Message model to prisma/schema.prisma first."
  );
}

export async function listMessages() {
  throw new Error(
    "listMessages is not implemented yet. Add a Message model to prisma/schema.prisma first."
  );
}


