import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const postList = [];

function Post(id,postContent){
    this.id = id;
    this.postContent = postContent;
}

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/about",(req,res) =>{
    res.render("about.ejs");
});

app.get("/contact",(req,res) =>{
    res.render("contact.ejs");
});

app.post("/submit", (req, res) => {
    const newPost = req.body["blog-post"];
    if (newPost) {
        const blogPost =new Post((postList.length+1), newPost);
        postList.push(blogPost);
        res.render("post.ejs",{savedPost : blogPost});
    } else {
        res.send("Input a post!");
    }
    
});

app.get("/posts",(req, res) => {
    res.render("allposts.ejs", {userPosts : postList});
});

app.post("/edit/:id",(req,res)=>{
    const postID = parseInt(req.params.id);
    const postEdit = postList.find((post)=>post.id===postID);
    res.render("edit.ejs",{postID:postID,postText:postEdit.postContent});
})

app.post("/edit-post/:id",async(req, res) => {
    const postID = parseInt(req.params.id);
    const newPost = req.body.newPost
    try {
        if (newPost) {
            const result = await axios.patch(`http:localhost:3000/editPost/${postID}`,{edittedPost:newPost});
            res.render("allposts.ejs", {userPosts : postList});    
        }else{
            res.send("Input a post to edit!");
        } 
    } catch (error) {
        console.log(error.message);
    }
});

app.patch("/editPost/:id",(req, res) =>{
    const postID = parseInt(req.params.id);
    const postEdit = postList.find((post)=>post.id===postID);
    const requestBody = req.body;
    if(postEdit){
        if(requestBody) postEdit.postContent=requestBody.edittedPost;
        res.json(postEdit);        
    }else{res.status(404).send("Post not found")};
    
});

app.delete("/delete-post/:id",(req, res) =>{
    const postID = parseInt(req.params.id);
    if(isNaN(postID)) return res.sendStatus(400);
    const postIndex = postList.findIndex((post) => post.id === postID);
    if (postIndex === -1) return res.sendStatus(404);
    postList.splice(postIndex,1);
    postList.forEach(element => {
       const newID = postList.findIndex((p) => p.id === element.id);
        element.id=newID+1;
    });
    res.json(postList);
});

app.post("/delete-post/:id",async(req,res)=>{
    const id = parseInt(req.params.id);
    try {
        const result = await axios.delete(`http://localhost:${port}/delete-post/${id}`);
        res.render("allPosts.ejs",{userPosts:postList});
    } catch (error) {
        res.send(JSON.stringify(error.message));
    }
})

app.listen(port,() =>{
    console.log(`Server running on port ${port}`);
});