import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const list=(value:unknown)=>String(value??"").split(/,|\n/).map(item=>item.trim()).filter(Boolean);
async function admin(){const user=await getCurrentUser();return user?.role==="ADMIN";}
async function jobData(input:Record<string,unknown>){
  const skills=list(input.skills);const data={company:String(input.company),companyInitials:String(input.company).split(" ").map(word=>word[0]).join("").slice(0,3).toUpperCase(),companyColour:"#1f756d",position:String(input.position),industry:String(input.industry),employmentType:String(input.employmentType),description:String(input.description),responsibilities:list(input.responsibilities),yearsExperience:Number(input.yearsExperience),salaryMin:Number(input.salaryMin),salaryMax:Number(input.salaryMax),location:String(input.location),workMode:String(input.workMode),visaRequirement:String(input.visaRequirement),applicationDeadline:new Date(String(input.applicationDeadline))};
  return {data,skills};
}
export async function POST(request:Request){if(!await admin())return NextResponse.json({error:"Not authorised"},{status:401});const input=await request.json();const {data,skills}=await jobData(input);if(data.salaryMin>data.salaryMax)return NextResponse.json({error:"Minimum salary must be below maximum salary."},{status:400});const job=await prisma.job.create({data:{...data,skills:{create:skills.map(name=>({skill:{connectOrCreate:{where:{name},create:{name}}}}))}}});return NextResponse.json(job);}
export async function PUT(request:Request){if(!await admin())return NextResponse.json({error:"Not authorised"},{status:401});const input=await request.json();const id=Number(input.id);const {data,skills}=await jobData(input);await prisma.$transaction(async tx=>{await tx.jobSkill.deleteMany({where:{jobId:id}});await tx.job.update({where:{id},data:{...data,skills:{create:skills.map(name=>({skill:{connectOrCreate:{where:{name},create:{name}}}}))}}});});return NextResponse.json({ok:true});}
export async function DELETE(request:Request){if(!await admin())return NextResponse.json({error:"Not authorised"},{status:401});const id=Number(new URL(request.url).searchParams.get("id"));await prisma.job.delete({where:{id}});return NextResponse.json({ok:true});}
