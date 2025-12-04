const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Infæmous Freight database…");

  // Create default users
  const admin = await prisma.user.upsert({
    where: { email: "admin@infamous.ai" },
    update: {},
    create: {
      email: "admin@infamous.ai",
      name: "System Admin",
      role: "admin"
    }
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: "dispatch@infamous.ai" },
    update: {},
    create: {
      email: "dispatch@infamous.ai",
      name: "Primary Dispatcher",
      role: "dispatcher"
    }
  });

  // Drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: "Michael Reyes",
      phone: "+1-202-555-0123",
      status: "active",
      avatarCode: "genesis"
    }
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Jada Kingsley",
      phone: "+1-202-555-0199",
      status: "active",
      avatarCode: "aurum"
    }
  });

  // Shipments
  await prisma.shipment.create({
    data: {
      reference: "NF-1001",
      origin: "Los Angeles, CA",
      destination: "Dallas, TX",
      status: "in_transit",
      driverId: driver1.id
    }
  });

  await prisma.shipment.create({
    data: {
      reference: "NF-1002",
      origin: "Chicago, IL",
      destination: "Atlanta, GA",
      status: "created",
      driverId: driver2.id
    }
  });

  console.log("🌱 Seed completed.");
}

main()
  .catch(e => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
