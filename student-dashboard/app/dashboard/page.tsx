 "use client";

import { useEffect, useState } from "react";
import {
  Award,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { API_URL } from "../../lib/api";

type Profile = {
  fullName: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
};

type Education = {
  id: string;
  college: string;
  degree: string;
  branch: string;
  cgpa: number;
  passingYear: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  github: string | null;
  liveLink: string | null;
  technology: string;
};

type Skill = {
  id: string;
  name: string;
};

type Data = {
  email: string;
  status: string;
  profile: Profile | null;
  education: Education[];
  projects: Project[];
  skills: Skill[];
};

type Completion = {
  completionPercentage: number;
  counts: {
    education: number;
    projects: number;
    skills: number;
  };
};

export default function Dashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vic_token");

    if (!token) {
      setError(
        "No JWT token found. Please log in to the VIC backend first."
      );
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_URL}/api/students/profile/complete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load student profile.");
        }

        return response.json();
      }),

      fetch(`${API_URL}/api/students/profile/completion`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load profile completion.");
        }

        return response.json();
      }),
    ])
      .then(([profileData, completionData]) => {
        setData(profileData);
        setCompletion(completionData);
      })
      .catch((error) => {
        setError(error.message || "Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="center">
        <div className="loader" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="center">
        <div className="error">
          <div className="error-logo">
            <img
              src="/vic-logo.png"
              alt="VIC Logo"
              className="error-logo-image"
            />
          </div>

          <h1>Student Dashboard</h1>

          <p>{error}</p>

          <code>
            localStorage.setItem("vic_token", "YOUR_JWT_TOKEN")
          </code>

          <a
            href="http://localhost:5000"
            target="_blank"
            rel="noreferrer"
          >
            Check backend
          </a>
        </div>
      </div>
    );
  }

  const name = data.profile?.fullName || "Student";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const percentage = completion?.completionPercentage || 0;

  const logout = () => {
    localStorage.removeItem("vic_token");
    window.location.reload();
  };

  return (
    <div className="shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${mobile ? "show" : ""}`}>
        <div className="brand">
          <img
            src="/vic-logo.png"
            alt="VIC Logo"
            className="vic-logo"
          />

          <span>
            <strong>VIC</strong>
            <small>Visionary Interns Club</small>
          </span>

          <button onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>

        <nav>
          {[
            ["Dashboard", LayoutDashboard],
            ["My Profile", UserRound],
            ["Education", GraduationCap],
            ["Projects", FolderKanban],
            ["Skills", Sparkles],
            ["Applications", BriefcaseBusiness],
            ["Certificates", Award],
          ].map(([name, Icon], index) => {
            const NavIcon = Icon as React.ElementType;

            return (
              <a
                className={index === 0 ? "active" : ""}
                key={String(name)}
              >
                <NavIcon />
                {String(name)}
              </a>
            );
          })}
        </nav>

        <div className="bottom">
          <a>
            <Settings />
            Settings
          </a>

          <button onClick={logout}>
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main>
        {/* HEADER */}
        <header>
          <button
            className="menub"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>

          <span className="crumb">
            Student Portal / Dashboard
          </span>

          <div className="user">
            <button>
              <Bell />
            </button>

            <i>{initials}</i>

            <span>
              <strong>{name}</strong>
              <small>Student</small>
            </span>

            <ChevronDown />
          </div>
        </header>

        {/* CONTENT */}
        <section className="content">
          {/* WELCOME */}
          <div className="welcome">
            <div>
              <label>
                <Sparkles />
                VIC STUDENT PORTAL
              </label>

              <h1>
                Good morning, {name.split(" ")[0]} 👋
              </h1>

              <p>
                Track your profile, projects and internship
                journey from one place.
              </p>
            </div>

            <button className="edit">
              <Pencil />
              Edit Profile
            </button>
          </div>

          {/* STATS */}
          <div className="stats">
            {[
              [
                UserRound,
                "Profile Completion",
                `${percentage}%`,
              ],
              [
                GraduationCap,
                "Education",
                completion?.counts.education ||
                  data.education.length,
              ],
              [
                FolderKanban,
                "Projects",
                completion?.counts.projects ||
                  data.projects.length,
              ],
              [
                Sparkles,
                "Skills",
                completion?.counts.skills ||
                  data.skills.length,
              ],
            ].map(([Icon, label, value]) => {
              const StatIcon = Icon as React.ElementType;

              return (
                <div className="stat" key={String(label)}>
                  <StatIcon />

                  <span>
                    {String(label)}
                    <strong>{String(value)}</strong>
                  </span>
                </div>
              );
            })}
          </div>

          {/* PROFILE + COMPLETION */}
          <div className="twocol">
            <Card title="Profile Overview" action="Edit">
              <div className="profile">
                <i>{initials}</i>

                <div>
                  <h2>{name}</h2>

                  <p>{data.email}</p>

                  {data.profile?.location && (
                    <small>
                      <MapPin />
                      {data.profile.location}
                    </small>
                  )}
                </div>
              </div>

              <p className="bio">
                {data.profile?.bio ||
                  "Add a professional bio."}
              </p>

              <footer>
                Account status

                <b>
                  <CheckCircle2 />
                  {data.status}
                </b>
              </footer>
            </Card>

            <Card
              title="Complete Your Profile"
              action="View"
            >
              <div
                className="ring"
                style={
                  {
                    "--p": `${percentage}%`,
                  } as React.CSSProperties
                }
              >
                <b>{percentage}%</b>
                <small>Complete</small>
              </div>

              <p className="muted">
                Keep your profile updated to improve
                internship opportunities.
              </p>

              {[
                "Basic profile",
                "Education",
                "Projects",
              ].map((item, index) => {
                const done =
                  index === 0 ||
                  (index === 1 &&
                    data.education.length > 0) ||
                  (index === 2 &&
                    data.projects.length > 0);

                return (
                  <div className="check" key={item}>
                    <CheckCircle2 />
                    {item}

                    <b>
                      {done ? "Done" : "Add"}
                    </b>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* EDUCATION + SKILLS */}
          <div className="twocol lower">
            <Card title="Education" action="Manage">
              {data.education.length ? (
                data.education.map((education) => (
                  <div
                    className="item"
                    key={education.id}
                  >
                    <GraduationCap />

                    <div>
                      <b>
                        {education.degree} —{" "}
                        {education.branch}
                      </b>

                      <small>
                        {education.college} · CGPA{" "}
                        {education.cgpa} ·{" "}
                        {education.passingYear}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </Card>

            <Card title="Skills" action="Manage">
              <div className="skills">
                {data.skills.map((skill) => (
                  <b key={skill.id}>{skill.name}</b>
                ))}

                <button>
                  <Plus />
                  Add Skill
                </button>
              </div>
            </Card>
          </div>

          {/* PROJECTS */}
          <Card title="Recent Projects" action="View All">
            <div>
              {data.projects.length ? (
                data.projects.map((project) => (
                  <div
                    className="project"
                    key={project.id}
                  >
                    <FolderKanban />

                    <div>
                      <b>{project.title}</b>

                      <p>{project.description}</p>

                      <small>
                        {project.technology}
                      </small>
                    </div>

                    <span>
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      )}

                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live Demo
                        </a>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <Empty />
              )}
            </div>
          </Card>

          <div className="copyright">
            © 2026 Visionary Interns Club · Student Portal
          </div>
        </section>
      </main>
    </div>
  );
}

/* CARD */

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="head">
        <h3>{title}</h3>

        <button>{action}</button>
      </div>

      {children}
    </section>
  );
}

/* EMPTY STATE */

function Empty() {
  return (
    <div className="empty">
      No data added yet.

      <button>
        <Plus />
        Add
      </button>
    </div>
  );
}