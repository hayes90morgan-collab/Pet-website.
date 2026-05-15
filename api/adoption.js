import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req,res){

// GET (ADMIN)
if(req.method==="GET"){
const {data}=await supabase.from("buyers").select("*").order("created_at",{ascending:false});
return res.json(data);
}

// DELETE
if(req.method==="DELETE"){
await supabase.from("buyers").delete().eq("id",req.query.id);
return res.json({success:true});
}

// POST
if(req.method==="POST"){
const {name,email,puppy}=req.body;

try{
await supabase.from("buyers").insert([
{name,email,puppy,created_at:new Date()}
]);

await resend.emails.send({
from:"Royal Puppies <onboarding@resend.dev>",
to:email,
subject:"🐶 Reservation Confirmed",
html:`<h2>Thank you ${name}</h2><p>Your request for ${puppy} is received.</p>`
});

return res.json({success:true});
}catch(err){
return res.status(500).json({error:err.message});
}
}

res.status(405).json({message:"Method not allowed"});
}
