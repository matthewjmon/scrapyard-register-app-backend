import mongoose from "mongoose";
import dotenv from "dotenv";
import Record from "../models/Record.js";
import Counter from "../models/Counter.js";

dotenv.config();

// Use a separate portfolio DB
const MONGO_URI = process.env.MONGO_URI_PORTFOLIO;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB (Portfolio DB)"))
  .catch(err => console.error(err));

const sampleRecords = [
  {
    fullNames: "John Doe",
    identityNumber: "9001011234567",
    verificationMethod: "ID",
    otherVerification: "",
    telephoneNumbers: ["0821234567", "0839876543"],
    vehicleRegistration: "ABC123GP",
    contactAddress: "123 Main Street, East London",
    goodsDescription: "Scrap metal",
    additionalNotes: "Handle with care",
  },
  {
    fullNames: "Jane Smith",
    identityNumber: "9205057654321",
    verificationMethod: "Passport",
    otherVerification: "Passport scanned",
    telephoneNumbers: ["0712345678"],
    vehicleRegistration: "XYZ987EC",
    contactAddress: "456 Market Street, East London",
    goodsDescription: "Car parts",
    additionalNotes: "",
  },
  {
    fullNames: "Sipho Nkosi",
    identityNumber: "8803035432109",
    verificationMethod: "ID",
    otherVerification: "",
    telephoneNumbers: ["0782345678", "0823456789"],
    vehicleRegistration: "LMN456MP",
    contactAddress: "789 Victoria Road, East London",
    goodsDescription: "Copper wiring",
    additionalNotes: "Urgent delivery",
  },
  {
    fullNames: "Thandiwe Moyo",
    identityNumber: "9507078765432",
    verificationMethod: "ID",
    otherVerification: "",
    telephoneNumbers: ["0734567890"],
    vehicleRegistration: "QRS321EC",
    contactAddress: "12 Garden Avenue, East London",
    goodsDescription: "Aluminium cans",
    additionalNotes: "Recyclable only",
  },
  {
    fullNames: "Kabelo Dlamini",
    identityNumber: "9109091122334",
    verificationMethod: "Driver's License",
    otherVerification: "License scanned",
    telephoneNumbers: ["0812345678", "0828765432"],
    vehicleRegistration: "TUV789GP",
    contactAddress: "34 Riverside Drive, East London",
    goodsDescription: "Old batteries",
    additionalNotes: "Store safely",
  },
  {
    fullNames: "Mary Johnson",
    identityNumber: "8705059988776",
    verificationMethod: "Passport",
    otherVerification: "Passport photo attached",
    telephoneNumbers: ["0723456789"],
    vehicleRegistration: "WXY654MP",
    contactAddress: "56 High Street, East London",
    goodsDescription: "Brass fittings",
    additionalNotes: "",
  },
  {
    fullNames: "Lerato Khumalo",
    identityNumber: "9302023344556",
    verificationMethod: "ID",
    otherVerification: "",
    telephoneNumbers: ["0791234567", "0832345678"],
    vehicleRegistration: "ABC789EC",
    contactAddress: "89 Sunset Boulevard, East London",
    goodsDescription: "Steel pipes",
    additionalNotes: "Inspect before loading",
  },
  {
    fullNames: "David Petersen",
    identityNumber: "8808086677889",
    verificationMethod: "Driver's License",
    otherVerification: "License scanned",
    telephoneNumbers: ["0845678901"],
    vehicleRegistration: "DEF123MP",
    contactAddress: "22 Ocean View, East London",
    goodsDescription: "Scrap electronics",
    additionalNotes: "Fragile items",
  }
];


// Helper to generate sequential codes like production
const getNextCode = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "record" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `ACQ-${String(counter.seq).padStart(3, "0")}`;
};

const seed = async () => {
  try {
    await Record.deleteMany({});
    await Counter.deleteMany({ name: "record" }); // reset counter

    for (const rec of sampleRecords) {
      const code = await getNextCode();
      const now = new Date();
      const formattedCreatedAt = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", " at");

      await Record.create({
        ...rec,
        code,
        createdAt: now,
        formattedCreatedAt,
      });
    }

    console.log("Seeding complete ✅");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
