const Blog = require("../models/blog.schema");
const User = require("../models/user.schema");
const Fuse = require("fuse.js");

const signup = async (req, res) => {
  const { username, password, email, role } = req.body;
  const Users = await User.findOne({ email: email });
  if (Users) {
    res.cookie("role", Users.role);
    res.cookie("id", Users.id);
    res.send(`Account created successfully ${Users.username}`);
  } 
  else {
    let newUser = await User.create(req.body);
    res.cookie("role", newUser.role);
    res.cookie("id", newUser.id);
    res.send(`Account created successfully ${newUser.username}`);
  }
};
const signups = (req, res) => {
  res.render("signup");
};
const loginpage = (req, res) => {
  res.render("login");
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user || user.password !== password) {
    return res.send("Invalid Credentials.");
  } 
  else {
    res.cookie("role", user.role);
    res.cookie("id", user.id);
    res.send(`Welcome User ${user.username}`);
  }
};
const createBlog = async (req, res) => {
  const { title, content, image, category } = req.body;
  let id = req.cookies.id;
  let userdata = await User.findById(id);
  const newBlog = new Blog({ title,content, image, category, author: userdata.username,});
  await newBlog.save();
  res.cookie("blogId", newBlog.id);
  res.send(`Blog created by ${userdata.username}`);
};
const craeteblogform = (req, res) => {
  if (req.cookies.role !== "admin") {
    return res.send("You are not authorized to access this page.");
  }
  res.render("blogcreate");
};
const blogs = async (req, res) => {
  const { category } = req.query;
  let query = {};
  if (category) {
    query.category = category;
  }
  const blogs = await Blog.find(query);
  res.json(blogs);
};
const blog = (req, res) => {
  res.render("blogpage");
};
const editblog = async (req, res) => {
  const blogId = req.params.id;
  const { title, content, image, category } = req.body;
  const updateData = { title, content, image, category };
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
      new: true,
    });
    if (!updatedBlog) {
      return res.status(404).send("Blog not found.");
    }      
    res.status(200).json(updatedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while updating the blog.");
  }
};
const deleteblog = async (req, res) => {
  const blogId = req.params.id;
  try {
    const deletedBlog = await Blog.findByIdAndRemove(blogId);
    if (!deletedBlog) {
      return res.status(404).send("Blog not found.");
    }
    res.send(`Blog with ID ${blogId} deleted successfully.`);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while deleting the blog.");
  }
};
const singleblog = async (req, res) => {
  const blogId = req.params.id;
  const singleBlog = await Blog.findById(blogId);
  if (!singleBlog) {
    return res.status(404).json({ error: "Blog not found" });
  }
  res.render("singleblogpage", { singleBlog });
};
const likeblog = async (req, res) => {
  const blogId = req.params.id;
  const blog = await Blog.findById(blogId);
  let user = await User.findById(req.cookies.id);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  } else {
    blog.likedBy.push({ username: user.username });
    await blog.save();
    res.json(blog);
  }
};
const comment = async (req, res) => {
  const blogId = req.params.id;
  const { text } = req.body;
  const blog = await Blog.findById(blogId);
  let user = await User.findById(req.cookies.id);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  } else {
    blog.comments.push({ username: user.username, text: text });
    await blog.save();
    res.json(blog);
  }
};
const search = async (req, res) => {
  const query = req.query.blogs;
  const blogs = await Blog.find();
  const options = {
    keys: ["author", "category", "title"],
  };
  const fuse = new Fuse(blogs, options);
  const result = fuse.search(query);
  res.json(result);
};
module.exports = {
  signups,
  signup,
  loginpage,
  login,
  createBlog,
  craeteblogform,
  blogs,
  blog,
  deleteblog,
  editblog,
  singleblog,
  likeblog,
  comment,
  search,
};
