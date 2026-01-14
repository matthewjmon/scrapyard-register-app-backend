import bcrypt from "bcryptjs";

const password = "ScrapManager42!"; // <-- replace with your literal password

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    console.log("Hashed password:", hash);
  }
});

