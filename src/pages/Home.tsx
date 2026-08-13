import { useTeam } from '../store';
import { Link } from 'react-router-dom';

export default function Home() {
  const { members } = useTeam();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Meet Our Team
        </h1>
        <p className="text-xl text-gray-500">
          We are a group of passionate individuals working together to build amazing products and solve complex problems.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {members.map(member => (
          <Link
            key={member.id}
            to={`/team/${member.id}`}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
              {member.photoUrl ? (
                <img 
                  src={member.photoUrl} 
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-sm font-medium text-blue-600 mb-3">{member.role}</p>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                {member.bio}
              </p>
              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                View Profile &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {members.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed">
          <p className="text-gray-500 mb-4">No team members added yet.</p>
          <Link to="/admin" className="text-blue-600 font-medium hover:underline">
            Go to Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
}
