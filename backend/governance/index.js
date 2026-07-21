'use strict';
const jwt=require('jsonwebtoken');
const { Sequelize }=require('sequelize');
const {createRouter}=require('./router');
const {sequelize}=require('./store');
const {evaluate}=require('./domain');
const database=new Sequelize(process.env.DATABASE_URL||'',{dialect:'postgres',logging:false});
function auth(req,res,next){const secret=process.env.JWT_SECRET||'';const token=req.headers.authorization&&req.headers.authorization.match(/^Bearer (.+)$/)?.[1];if(secret.length<32)return res.status(503).json({error:'secure JWT configuration required'});if(!token)return res.status(401).json({error:'bearer token required'});try{req.user=jwt.verify(token,secret,{algorithms:['HS256']});}catch(_){return res.status(401).json({error:'invalid token'});}next();}
module.exports=createRouter({db:sequelize(database),auth,evaluate,workflow:'video-content-publish',providers:['media-storage','transcription','translation','rights-registry','moderation','youtube','tiktok','instagram','analytics','notification','webhook'],approverRoles:['content_reviewer','rights_reviewer','brand_reviewer','admin']});
