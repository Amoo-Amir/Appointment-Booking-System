let User = require("../model/user.model");
const asynchandler = require("../middleware/asynchandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const register = asynchandler(async (req, res) => {
  const { fullName, email, password, phone, secretkey } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "email and password are required." });
  }

  const exists = await User.findOne({
    email: String(email).toLowerCase().trim(),
  });
  if (exists) {
    return res
      .status(400)
      .json({ success: false, message: "this email allredy exists." });
  }

  const hashed = await bcrypt.hash(password, 12);
  if (!hashed) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your password.",
    });
  }

  const newuser = new User({
    fullName,
    email,
    password: hashed,
    phone,
    role: "user",
  });

  if (secretkey && secretkey === process.env.ADMIN_SECRET_KEY) {
    newuser.role = "admin";
  }

  const saved = await newuser.save();

  res.status(200).json({ success: true, saved });
});

const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +refreshToken ",
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      userRole: user.role,
      email: user.email,
    },
    process.env.SECRET_KEYT,
    { expiresIn: "1d" },
  );

  const userResponse = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  user.refreshToken = token;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: userResponse,
  });
});

const profile = asynchandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(400).json({
      seccess: false,
      message: "user not found.",
    });
  }
  res.status(200).json({ seccess: true, user });
});

const updateprofile = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { email, password, fullName } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "id is not valid",
    });
  }

  if (req.userId.toString() !== id) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own profile",
    });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedPassword = String(password).trim();

  if (!normalizedPassword) {
    return res.status(400).json({
      success: false,
      message: "password not valid",
    });
  }

  const user = await User.findById(id).select("+password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user not found.",
    });
  }

  if (fullName) {
    user.fullName = fullName;
  }

  const isPasswordValid = await bcrypt.compare(
    normalizedPassword,
    user.password,
  );

  if (isPasswordValid && email) {
    if (normalizedEmail === user.email) {
      return res.status(400).json({
        success: false,
        message: "New email is the same as current email. No change needed.",
      });
    }

    const emailexists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });
    if (emailexists) {
      return res.status(409).json({
        success: false,
        message: "This email is already taken by another user.",
      });
    }

    user.email = normalizedEmail;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile fully updated (name and email changed)",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } else if (isPasswordValid && !email) {
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated (only name changed, no email provided)",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } else if (!isPasswordValid) {
    await user.save();
    return res.status(200).json({
      success: true,
      message:
        "Profile updated (only name changed, email unchanged due to wrong password)",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  }
});

const deleteaccount = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  const normalaizeEmail = String(email).toLowerCase().trim();

  if (!normalaizeEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "email and password are required",
    });
  }

  const user = await User.findOne({ email: normalaizeEmail }).select(
    "+password",
  );
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user with this email no exists",
    });
  }

  const passwordcompare = await bcrypt.compare(password, user.password);
  if (!passwordcompare) {
    return res.status(401).json({
      success: false,
      message: "some thing went wrong.",
    });
  }

  if (req.userId?.toString() !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "sinvalid credentials or unauthorized",
    });
  }

  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: "user deleted successfully",
  });
});

const changepassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword, confrimNewPassword } = req.body;
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "user id format isnt valid.",
    });
  }

  if (!oldpassword || !newpassword || !confrimNewPassword) {
    return res.status(400).json({
      success: false,
      message: "all fildes are required",
    });
  }

  const user = await User.findById(String(id)).select("+password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user with tis id not found ",
    });
  }

  const isOwner = req?.userId?.toString() === user._id?.toString();
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: "you can only change your own account password",
    });
  }

  const passcompare = await bcrypt.compare(oldpassword, user.password);
  if (!passcompare) {
    return res.status(401).json({
      success: false,
      message: "password is wrong",
    });
  }

  if (newpassword !== confrimNewPassword) {
    return res.status(400).json({
      success: false,
      message: "password confirmation does not match",
    });
  }

  const hashnewpassword = await bcrypt.hash(newpassword, 12);

  user.password = hashnewpassword;

  await user.save();

  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "password changed",
  });
});

module.exports = {
  register,
  login,
  profile,
  updateprofile,
  deleteaccount,
  changepassword,
};
