 "use client";
import {useEffect,useState} from "react";
import {Award,Bell,BriefcaseBusiness,CheckCircle2,ChevronDown,FolderKanban,GraduationCap,LayoutDashboard,LogOut,MapPin,Menu,Pencil,Plus,Settings,Sparkles,UserRound,X} from "lucide-react";
import {API_URL} from "../../lib/api";
type Profile={fullName:string|null;phone:string|null;bio:string|null;location:string|null};
type Education={id:string;college:string;degree:string;branch:string;cgpa:number;passingYear:number};
type Project={id:string;title:string;description:string;github:string|null;liveLink:string|null;technology:string};
type Skill={id:string;name:string};
type Data={email:string;status:string;profile:Profile|null;education:Education[];projects:Project[];skills:Skill[]};
type Completion={completionPercentage:number;counts:{education:number;projects:number;skills:number}};
export default function Dashboard(){
 const[data,setData]=useState<Data|null>(null),[completion,setCompletion]=useState<Completion|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[mobile,setMobile]=useState(false);
 useEffect(()=>{const t=localStorage.getItem("vic_token");if(!t){setError("No JWT token found. Log in to the VIC backend and save the JWT as vic_token in localStorage.");setLoading(false);return}
 Promise.all([fetch(API_URL+"/api/students/profile/complete",{headers:{Authorization:"Bearer "+t}}).then(r=>r.json()),fetch(API_URL+"/api/students/profile/completion",{headers:{Authorization:"Bearer "+t}}).then(r=>r.json())]).then(([d,c])=>{setData(d);setCompletion(c)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="center"><div className="loader"/><p>Loading dashboard...</p></div>;
 if(error||!data)return <div className="center"><div className="error"><b>VIC</b><h1>Student Dashboard</h1><p>{error}</p><code>localStorage.setItem("vic_token","YOUR_JWT_TOKEN")</code><a href="http://localhost:5000" target="_blank">Check backend</a></div></div>;
 const name=data.profile?.fullName||"Student",initials=name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(),pct=completion?.completionPercentage||0;
 const logout=()=>{localStorage.removeItem("vic_token");location.reload()};
 return <div className="shell">
 <aside className={"sidebar "+(mobile?"show":"")}><div className="brand"><b>V</b><span><strong>VIC</strong><small>Visionary Interns Club</small></span><button onClick={()=>setMobile(false)}><X/></button></div>
 <nav>{[["Dashboard",LayoutDashboard],["My Profile",UserRound],["Education",GraduationCap],["Projects",FolderKanban],["Skills",Sparkles],["Applications",BriefcaseBusiness],["Certificates",Award]].map(([n,I],i)=><a className={i===0?"active":""} key={String(n)}><I/> {n}</a>)}</nav>
 <div className="bottom"><a><Settings/> Settings</a><button onClick={logout}><LogOut/> Logout</button></div></aside>
 <main><header><button className="menub" onClick={()=>setMobile(true)}><Menu/></button><span className="crumb">Student Portal / Dashboard</span><div className="user"><button><Bell/></button><i>{initials}</i><span><strong>{name}</strong><small>Student</small></span><ChevronDown/></div></header>
 <section className="content"><div className="welcome"><div><label><Sparkles/> VIC STUDENT PORTAL</label><h1>Good morning, {name.split(" ")[0]} 👋</h1><p>Track your profile, projects and internship journey from one place.</p></div><button className="edit"><Pencil/> Edit Profile</button></div>
 <div className="stats">{[[UserRound,"Profile Completion",pct+"%"],[GraduationCap,"Education",completion?.counts.education||data.education.length],[FolderKanban,"Projects",completion?.counts.projects||data.projects.length],[Sparkles,"Skills",completion?.counts.skills||data.skills.length]].map(([I,l,v])=><div className="stat" key={String(l)}><I/><span>{l}<strong>{v}</strong></span></div>)}</div>
 <div className="twocol"><Card title="Profile Overview" action="Edit"><div className="profile"><i>{initials}</i><div><h2>{name}</h2><p>{data.email}</p>{data.profile?.location&&<small><MapPin/> {data.profile.location}</small>}</div></div><p className="bio">{data.profile?.bio||"Add a professional bio."}</p><footer>Account status <b><CheckCircle2/> {data.status}</b></footer></Card>
 <Card title="Complete Your Profile" action="View"><div className="ring" style={{"--p":pct+"%"} as React.CSSProperties}><b>{pct}%</b><small>Complete</small></div><p className="muted">Keep your profile updated to improve internship opportunities.</p>{["Basic profile", "Education","Projects"].map((x,i)=><div className="check" key={x}><CheckCircle2/> {x}<b>{i===0||[data.education.length,data.projects.length][i-1]?"Done":"Add"}</b></div>)}</Card></div>
 <div className="twocol lower"><Card title="Education" action="Manage">{data.education.length?data.education.map(e=><div className="item" key={e.id}><GraduationCap/><div><b>{e.degree} — {e.branch}</b><small>{e.college} · CGPA {e.cgpa} · {e.passingYear}</small></div></div>):<Empty/>}</Card>
 <Card title="Skills" action="Manage"><div className="skills">{data.skills.map(s=><b key={s.id}>{s.name}</b>)}<button><Plus/> Add Skill</button></div></Card></div>
 <Card title="Recent Projects" action="View All"><div>{data.projects.length?data.projects.map(p=><div className="project" key={p.id}><FolderKanban/><div><b>{p.title}</b><p>{p.description}</p><small>{p.technology}</small></div><span>{p.github&&<a href={p.github} target="_blank">GitHub</a>}{p.liveLink&&<a href={p.liveLink} target="_blank">Live Demo</a>}</span></div>):<Empty/>}</div></Card>
 <div className="copyright">© 2026 Visionary Interns Club · Student Portal</div></section></main></div>}
function Card({title,action,children}:{title:string;action:string;children:React.ReactNode}){return <section className="card"><div className="head"><h3>{title}</h3><button>{action}</button></div>{children}</section>}
function Empty(){return <div className="empty">No data added yet.<button><Plus/> Add</button></div>}