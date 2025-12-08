import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Zap, MapPin, Trash2 } from 'lucide-react';
// FIX: Changing to explicit relative path to resolve compilation issue for external file.
import { deleteProposal } from '../actions/proposal-actions';

// Mock types based on your Schema for presentation

export type Skill = {

  id: string;

  name: string;

};



export type Proposal = {

  id: string;

  title: string;

  description: string;

  modality: 'Remote' | 'In-Person';

  offeredSkills: Skill[];

  neededSkills: Skill[];

  ownerId: string;

};

import { getCurrentUserId } from '../lib/auth';

// A simple component for showing a skill tag
const SkillTag: React.FC<{ name: string; type: 'offered' | 'needed' }> = ({ name, type }) => (
  <Badge
    className={`
      text-sm font-medium transition-all duration-150 ease-in-out 
      ${type === 'offered'
        ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
        : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'}
    `}
  >
    {name}
  </Badge>
);

interface ProposalCardProps {
  proposal: Proposal;
  onActionComplete: () => void; // Function to refresh data after action
}

export function ProposalCard({ proposal, onActionComplete }: ProposalCardProps) {
  const [isOwner, setIsOwner] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const checkOwnership = async () => {
      const currentUserId = await getCurrentUserId();
      setIsOwner(currentUserId === proposal.ownerId);
    };
    checkOwnership();
  }, [proposal.ownerId]);

  // Function to call the server action and trigger a refresh
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this proposal? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteProposal(proposal.id);
    setIsDeleting(false);

    if (result.success) {
      window.alert(`Deletion successful: ${result.message}`);
      onActionComplete(); // Revalidate data on dashboard
    } else {
      console.error(result.message);
      window.alert(`Deletion failed: ${result.message}`);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
      <CardHeader className="p-4 border-b bg-gray-50/50">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2">{proposal.title}</CardTitle>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
              title="Rescind Offer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <CardDescription className="text-sm text-gray-500 flex items-center mt-1">
          {proposal.modality === 'Remote' ? (
            <Zap className="w-4 h-4 mr-1 text-indigo-500" />
          ) : (
            <MapPin className="w-4 h-4 mr-1 text-green-600" />
          )}
          {proposal.modality}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow p-4 space-y-3">
        {/* Offered Skill Section */}
        <div className="border-l-4 border-indigo-500 pl-3">
          <h4 className="text-xs font-semibold uppercase text-indigo-600 mb-1">Offering</h4>
          <div className="flex flex-wrap gap-2">
            {proposal.offeredSkills.map((skill) => (
              <SkillTag key={skill.id} name={skill.name} type="offered" />
            ))}
          </div>
        </div>

        {/* Needed Skill Section */}
        <div className="border-l-4 border-yellow-400 pl-3">
          <h4 className="text-xs font-semibold uppercase text-yellow-600 mb-1">Seeking</h4>
          <div className="flex flex-wrap gap-2">
            {proposal.neededSkills.map((skill) => (
              <SkillTag key={skill.id} name={skill.name} type="needed" />
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 pt-2 line-clamp-3">
          {proposal.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 border-t">
        <button
          className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-150"
        >
          {isOwner ? 'View Applicants' : 'Request Swap'}
        </button>
      </CardFooter>
    </Card>
  );
}