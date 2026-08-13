import { useParams, Link } from 'react-router-dom';
import { useTeam } from '../store';
import { downloadVCard } from '../utils';
import { Github, Instagram, Linkedin, Mail, Phone, ArrowLeft, Download, Award, Code2 } from 'lucide-react';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { members } = useTeam();
  const member = members.find(m => m.id === id);

  if (!member) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <p className="text-gray-500 mb-8">The team member you are looking for does not exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>
      </div>
    );
  }

  const fontClass = 
    member.fontFamily === 'serif' ? 'font-serif' : 
    member.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${fontClass}`}>
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Team
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        {member.coverUrl && (
          <div className="w-full h-48 sm:h-64 overflow-hidden">
            <img src={member.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Header Profile Section */}
        <div className={`p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-gray-100 ${member.coverUrl ? '-mt-16 sm:-mt-24 relative z-10' : ''}`}>
          <div className="w-32 h-32 sm:w-48 sm:h-48 shrink-0 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{member.name}</h1>
            <p className="text-lg text-blue-600 font-medium mb-4">{member.role}</p>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">{member.bio}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-12">
            {/* Achievements */}
            {member.achievements && member.achievements.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Achievements
                </h3>
                <ul className="space-y-4">
                  {member.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Skills */}
            {member.skills && member.skills.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                  <Code2 className="w-6 h-6 text-indigo-500" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Contact & Social Links */}
            <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Connect</h3>
              <div className="space-y-4">
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{member.phone}</span>
                  </a>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-medium break-all">{member.email}</span>
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#0A66C2]">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <span className="font-medium">LinkedIn</span>
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-gray-900">
                      <Github className="w-5 h-5" />
                    </div>
                    <span className="font-medium">GitHub</span>
                  </a>
                )}
                {member.instagram && (
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#E1306C]">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Instagram</span>
                  </a>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => downloadVCard(member)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Save Contact
                </button>
              </div>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
