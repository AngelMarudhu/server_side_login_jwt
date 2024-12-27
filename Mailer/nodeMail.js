import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const nodeConfig = {
  service: "gmail",
  port: 587,
  auth: {
    user: "marudhuthara09@gmail.com",
    //redvurbrmifpnfko KEEP SECURE
    pass: "redvurbrmifpnfko",
  },
};

let transoporter = nodemailer.createTransport(nodeConfig);

let mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

// post method @param {username : "Marudhupandiyan", userEmail : "angeldeveloper09@gmail.com", text : "HI This is mail Generator", subject : "Thanks for Choosing Mail Generator"}

export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  var email = {
    body: {
      name: username,
      intro: text || "welcome to Mail Marudhupandiyan",
      outro: "You Need Help Please Subscribe to Mail Marudhupandiyan",
    },
  };
  var emailBody = mailGenerator.generate(email);
  var emailText = mailGenerator.generatePlaintext(email);

  let data = {
    from: "marudhuthara09@gmail.com",
    to: userEmail,
    subject: subject || "Marudhupandiyan Plain Subject...",
    html: emailBody,
  };
  // ============ Send Email =============
  transoporter
    .sendMail(data)
    .then(() => {
      return res.status(201).json({ message: "you are received mail from us" });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};
