import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

const resend = new Resend(
process.env.RESEND_API_KEY
);

export default async function handler(req,res){

if(req.method==="GET"){

const { data } = await supabase
.from("buyers")
.select("*")
.order("created_at",{ascending:false});

return res.status(200).json(data);

}

if(req.method==="DELETE"){

await supabase
.from("buyers")
.delete()
.eq("id",req.query.id);

return res.status(200).json({
success:true
});

}

if(req.method==="POST"){

const {
name,
email,
puppy,
message
}=req.body;

const trackingId =
"RBP-"+Math.floor(Math.random()*100000);

try{

await supabase
.from("buyers")
.insert([{

name,
email,
puppy,
message,
tracking_id:trackingId,
created_at:new Date()

}]);

await resend.emails.send({

from:"Royal Blossom Puppies <onboarding@resend.dev>",

to:email,

subject:"🐶 Reservation Received",

html:`

<h2>Thank you ${name}</h2>

<p>
Your reservation request for ${puppy}
has been received successfully.
</p>

<p>
Tracking ID:
<b>${trackingId}</b>
</p>

`

});

return res.status(200).json({

success:true,
trackingId

});

}catch(err){

return res.status(500).json({
error:err.message
});

}

}

return res.status(405).json({
message:"Method not allowed"
});

}
