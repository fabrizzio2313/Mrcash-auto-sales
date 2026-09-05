import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { buildVehicleSlugBase } from "../lib/slug";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Dealership Admin",
    },
  });
  console.log(`Admin user ready: ${adminEmail} / ${adminPassword}`);

  // Seed the singleton business-settings row with the same values that are
  // compiled in as defaults (see lib/site.ts), so the /admin/settings form
  // opens pre-filled. `update: {}` keeps any edits an admin has already made.
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "Mr. Cash Auto Sales",
      phoneDisplay: "(863) 241-0086",
      phoneE164: "+18632410086",
      whatsappE164: "+18632410086",
      email: "sales@mrcashautosales.example",
      addressLine1: "244 E Bullard Ave",
      addressLine2: "Lake Wales, FL 33853",
      hoursWeekdays: "9:00 AM – 7:00 PM",
      hoursSaturday: "10:00 AM – 5:00 PM",
      hoursSunday: "Closed",
      facebookUrl: "",
      notificationEmail: "",
    },
  });
  console.log("Business settings ready.");

  const existingCount = await prisma.vehicle.count();
  if (existingCount > 0) {
    console.log(`Skipping vehicle seed — ${existingCount} vehicle(s) already exist.`);
    return;
  }

  const vehicles = [
    {
      stockNumber: "A1001",
      make: "Toyota",
      model: "Camry",
      year: 2021,
      trim: "SE",
      price: 21500,
      mileage: 32000,
      color: "Silver",
      fuelType: "GASOLINE" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "Sedan",
      status: "AVAILABLE" as const,
      featured: true,
      onSale: true,
      originalPrice: 23500,
      description:
        "Clean one-owner Camry SE with a full service history. Great fuel economy and a smooth, reliable ride.",
      features: "Bluetooth\nBackup Camera\nHeated Seats\nLane Assist",
      photos: {
        create: [
          { url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200", order: 0 },
        ],
      },
    },
    {
      stockNumber: "A1002",
      make: "Honda",
      model: "CR-V",
      year: 2020,
      trim: "EX-L",
      price: 24900,
      mileage: 41000,
      color: "Black",
      fuelType: "GASOLINE" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "SUV",
      status: "AVAILABLE" as const,
      featured: true,
      onSale: false,
      description:
        "Spacious and dependable CR-V EX-L with leather seats, sunroof, and all-wheel drive.",
      features: "Leather Seats\nSunroof\nAll-Wheel Drive\nApple CarPlay",
      photos: {
        create: [
          { url: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=1200", order: 0 },
        ],
      },
    },
    {
      stockNumber: "A1003",
      make: "Ford",
      model: "F-150",
      year: 2019,
      trim: "XLT",
      price: 28900,
      mileage: 55000,
      color: "Blue",
      fuelType: "GASOLINE" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "Truck",
      status: "PENDING" as const,
      featured: true,
      onSale: false,
      description:
        "Capable F-150 XLT with tow package, backup camera, and plenty of bed space for work or play.",
      features: "Tow Package\nBackup Camera\nBed Liner",
      photos: {
        create: [
          { url: "https://images.unsplash.com/photo-1595750462305-3c6c7b0fdaf3?w=1200", order: 0 },
        ],
      },
    },
    {
      stockNumber: "A1004",
      make: "Nissan",
      model: "Altima",
      year: 2018,
      trim: "S",
      price: 15800,
      mileage: 68000,
      color: "White",
      fuelType: "GASOLINE" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "Sedan",
      status: "SOLD" as const,
      featured: false,
      description: "Affordable, well-maintained commuter sedan.",
      features: "Bluetooth\nCruise Control",
      photos: { create: [] },
    },
    {
      stockNumber: "A1005",
      make: "Chevrolet",
      model: "Equinox",
      year: 2022,
      trim: "LT",
      price: 26500,
      mileage: 19000,
      color: "Red",
      fuelType: "GASOLINE" as const,
      transmission: "AUTOMATIC" as const,
      bodyType: "SUV",
      status: "AVAILABLE" as const,
      featured: false,
      onSale: true,
      originalPrice: 28500,
      description: "Low-mileage Equinox LT still under factory warranty.",
      features: "Backup Camera\nRemote Start",
      photos: { create: [] },
    },
  ];

  const createdVehicles = [];
  for (const vehicle of vehicles) {
    const slug = buildVehicleSlugBase(vehicle);
    createdVehicles.push(await prisma.vehicle.create({ data: { ...vehicle, slug } }));
  }
  console.log(`Seeded ${vehicles.length} vehicles.`);

  await prisma.lead.create({
    data: {
      name: "Jamie Rivera",
      email: "jamie.rivera@example.com",
      phone: "555-201-3344",
      type: "TEST_DRIVE",
      vehicleId: createdVehicles[0].id,
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      message: "Is this Camry still available? I'd like to test drive it this weekend.",
      status: "NEW",
    },
  });
  console.log("Seeded 1 lead.");

  await prisma.review.createMany({
    data: [
      {
        name: "Marcus Bell",
        rating: 5,
        comment:
          "Smooth, no-pressure buying experience. The car was exactly as described and the paperwork took ten minutes.",
        status: "APPROVED",
      },
      {
        name: "Dana Whitfield",
        rating: 5,
        comment:
          "Got approved for financing when two other lots turned me down. Drove home the same day. Highly recommend.",
        status: "APPROVED",
      },
      {
        name: "Priya Nair",
        rating: 4,
        comment:
          "Good selection and fair prices. Only reason for 4 stars is I had to wait a bit for a test drive on a busy Saturday.",
        status: "APPROVED",
      },
      {
        name: "Chris Okafor",
        rating: 5,
        comment: "Just left a review — waiting to see if it gets posted!",
        status: "PENDING",
      },
    ],
  });
  console.log("Seeded 4 reviews.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
