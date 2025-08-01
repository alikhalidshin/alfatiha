const express = require("express");
const methodOverride = require("method-override");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 9000;

// 🔌 MongoDB Atlas Connection
mongoose.connect("mongodb+srv://shinalikhalid:7sionpfm9quOXQ47@basera.4o9xqkw.mongodb.net/?retryWrites=true&w=majority&appName=Basera", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));



// 🧾 Schemas
const newCompanySchema = new mongoose.Schema({
  companyEmail: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
   // إيميل الشركة
  password: { type: String, required: true }, // كلمة السر

  employees: {
    manager: String,
    staff: [String],
    total: Number,
  },


 info: {
  location: { type: String },               // مكان الشركة
  establishedYear: { type: String },        // سنة التأسيس
  sector: { type: String },                 // القطاع أو النشاط
  notes: { type: String },                  // ملاحظات عامة

  dynamicFields: {
    lastUpdated: { type: Date, default: Date.now }, // وقت آخر تعديل
    updatedBy: { type: String },                    // اسم الشخص المعدّل
    flags: [String],                                // كلمات تشرح الحالة أو الملاحظات
  },

  clientList: [                                   // العملاء المراد البحث عنهم
    {
      name: { type: String, required: true },     // اسم العميل                  // تصنيف أو ملاحظة
    }
  ],

  stackClients: [                                 // العملاء اللي تم إضافتهم داخل الستاك
    {
      user: { type: String },
    }
  ]
}

});
const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
});

const clientSchema = new mongoose.Schema({
  employees: String,
  businessAge: String,
  revenueExpenses: String,
  hasERP: String,
  manualRevenue: String,
  invoiceVolume: String,
  paymentRate: String,
  delays: String,
  loans: String,
  bankBalance: String,
});
//info
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  risk: {
    type: String,
    enum: ["Low", "Med", "High", "rev"],
    default: "Review",
  },
  status: {
    type: String,
    enum: ["Approved", "Rejected", "Pending", "Review"],
    default: "Draft",
  },

  date: { type: Date },
  actions: [{ type: String }], // مثل ['View', 'Re-analyze']

  // 🧠 AI Assessment Fields
  recommendation: {
    summary: String,
    explanation: String,
  },
  assessedBy: String,
  sector: String,

  scores: {
    capacity: Number,
    willingness: Number,
    context: Number,
    stability: Number,
    finalScore: Number,
    finalScorePercent: String,
  },

  financialIndicators: {
    averageMonthlyRevenue: Number,
    averageExpenses: Number,
    bankBalance: Number,
    onTimeInvoices: Number,
  },
});

// 📦 Models
const CompanyModel = mongoose.model("Company", newCompanySchema);
const UserModel = mongoose.model("User", userSchema);
const ClientModel = mongoose.model("Client", clientSchema);
const ReportModel = mongoose.model("Report", companySchema);


// ⚙️ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(cors());


// 🛣️ Routes

app.get("/", (req, res) => {
  res.json({ hello: "welcome to amd hackathon" });
});

// 🧾 Add Client
app.post("/clients", async (req, res) => {
  try {
    const newClient = new ClientModel(req.body);
    const savedClient = await newClient.save();
    res.status(201).json({
      message: "Client added successfully",
      data: savedClient,
    });
  } catch (error) {
    console.error("Error saving client:", error);
    res.status(500).json({ error: "Something went wrong while saving" });
  }
});

// 📊 Get Reports
app.get("/report", async (req, res) => {
  try {
    const reports = await ReportModel.find();
    res.status(200).json({ data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Something went wrong while fetching" });
  }
});
app.post("/companies", async (req, res) => {
  try {
    const { companyEmail } = req.body;

    // 🔍 تحقق من وجود الشركة مسبقاً
    const existingCompany = await CompanyModel.findOne({ companyEmail });

    if (existingCompany) {
      return res.status(409).json({
        error: "Company already exists with this email",
      });
    }

    const newCompany = new CompanyModel(req.body);
    const savedCompany = await newCompany.save();

    res.status(201).json({
      message: "Company added successfully",
      data: savedCompany,
    });
  } catch (error) {
    console.error("Error saving company:", error);
    res.status(500).json({ error: "Failed to save company" });
  }
});

// 🛑 General Error Handler
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error occurred" });
});

// 🚀 Start Server
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}/`);
});
app.post("/companies", async (req, res) => {
  try {
    const { companyEmail } = req.body;

const existingCompany = await CompanyModel.findOne({
  $or: [
    { companyEmail: req.body.companyEmail },
    { companyName: req.body.companyName }
  ]
});
   if (existingCompany) {
  return res.status(409).json({
    error: "Company already exists with this email or name",
  });
}

    const newCompany = new CompanyModel(req.body);
    const savedCompany = await newCompany.save();

    res.status(201).json({
      message: "Company added successfully",
      data: savedCompany,
    });
  } catch (error) {
    console.log("Error saving company:", error);
    res.status(500).json({ error: "Failed to save company" });
  }
});
app.post("/login", async (req, res) => {

  try {
    const { companyEmail, password } = req.body;

    console.log("#######################################################3333")
    console.log(companyEmail,password)
    console.log("######################################################################3333")

    // 🔍 تحقق من وجود الشركة بالبريد الإلكتروني
    const company = await CompanyModel.findOne({ companyEmail });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // 🔐 التحقق من كلمة السر
    if (company.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // ✅ نجاح تسجيل الدخول
    res.status(200).json({
      message: "Login successful",
      company: {
        username: company.username,
        email: company.companyEmail,
        info: company.info
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});
