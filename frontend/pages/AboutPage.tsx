
import React from 'react';
import Card from '@/components/ui/Card';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">About Unmute World</h1>
        <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
          <p>
            Welcome to <strong>Unmute World</strong>, a sanctuary for free expression and diverse perspectives. In a world that's often noisy and overwhelming, we've created a space where your voice can be heard, your stories can unfold, and your ideas can spark meaningful conversations.
          </p>
          <p>
            Our mission is to empower individuals to share their unique thoughts, whether it's through the lyrical flow of poetry, the critical analysis of politics, the exciting frontiers of technology, or the raw honesty of personal stories. We believe that every perspective has value, and every voice deserves a platform.
          </p>
          <h2 className="text-2xl font-bold text-slate-700 mt-6">Our Core Principles</h2>
          <ul className="list-disc pl-6">
            <li>
              <strong>Anonymity & Authenticity:</strong> We give you the choice to post with your name or as an anonymous contributor. This flexibility allows for both vulnerability and accountability, fostering a community built on trust.
            </li>
            <li>
              <strong>Community & Respect:</strong> Unmute World is more than just a platform; it's a community. We are committed to maintaining a respectful and constructive environment where all members feel safe to express themselves without fear of harassment.
            </li>
            <li>
              <strong>Discovery & Connection:</strong> With a wide range of categories and a powerful tagging system, you can easily discover content that resonates with you and connect with writers who share your interests.
            </li>
          </ul>
          <p>
            Whether you're here to write, to read, or to engage, we're glad to have you. Let's unmute the world, one post at a time.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
