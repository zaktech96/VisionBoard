import { Computer, Network, Zap } from 'lucide-react';
import { OrbitingCirclesComponent } from './orbiting-circles';
import { TITLE_TAILWIND_CLASS } from '@/utils/constants';

const features = [
  {
    name: 'Build faster',
    description:
      'Get up and running in no time with pre-configured settings and best practices. Say goodbye to setup and focus on what truly matters - building your application.',
    icon: Zap,
  },
  {
    name: 'Production Ready',
    description:
      'Built with modern tools and best practices. Authentication, database, payments, and more - everything you need to launch your SaaS is included.',
    icon: Computer,
  },
  {
    name: 'Scale with ease',
    description:
      'Built on a rock-solid foundation with NextJS, TypeScript, and Tailwind CSS. Deploy with confidence and scale without worry.',
    icon: Network,
  },
];

export default function SideBySide() {
  return (
    <div className="overflow-hidden ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <p
                className={`${TITLE_TAILWIND_CLASS} mt-2 font-semibold tracking-tight dark:text-white text-gray-900`}
              >
                A faster way to production
              </p>
              <dl className="mt-10 max-w-xl space-y-8 leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold dark:text-gray-100 text-gray-900">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline dark:text-gray-400">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <OrbitingCirclesComponent />
        </div>
      </div>
    </div>
  );
}
