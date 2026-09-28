import React, { memo } from 'react';

interface KineticProps {
  text: string;
  className?: string;
}

/**
 * Kinetic Assembly — splits a headline into characters that assemble
 * (rise + unblur) with a per-character stagger when the ancestor
 * `.section-fade` gains `.visible`. Pure CSS transitions; runs once.
 * Words stay atomic (inline-block) so line wrapping never breaks mid-word.
 */
const Kinetic: React.FC<KineticProps> = ({ text, className = '' }) => {
  let i = 0;
  return (
    <span className={`kinetic ${className}`} aria-label={text} role="text">
      {text.split(' ').map((word, wi) => (
        <React.Fragment key={wi}>
          {wi > 0 && ' '}
          <span className="k-word">
            {word.split('').map((ch, ci) => (
              <span key={ci} aria-hidden="true" style={{ transitionDelay: `${i++ * 35}ms` }}>
                {ch}
              </span>
            ))}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
};

export default memo(Kinetic);
