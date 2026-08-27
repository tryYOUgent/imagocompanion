tailwind.config = {
      theme: {
        extend: {
          colors: {
            imago: {
              navy: '#17375f',
              blue: '#5B7FA6',
              teal: '#4FAE9E',
              mist: '#f7fafc',
              ink: '#30455d'
            }
          },
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            serif: ['Libre Baskerville', 'Georgia', 'serif']
          },
          boxShadow: {
            soft: '0 18px 50px rgba(23,55,95,.08)',
            card: '0 8px 28px rgba(23,55,95,.06)'
          }
        }
      }
    }

(function () {
      const key = 'imago_my_relationship_vision_final_draft_v1';
      const content = document.getElementById('visionContent');
      const emptyState = document.getElementById('emptyState');
      const revealSections = [
        document.querySelector('[data-section="guidance"]'),
        document.querySelector('[data-section="closing"]'),
        document.querySelector('[data-section="actions"]')
      ];

      function getDraft() {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const draft = JSON.parse(raw);
          if (!draft || !Array.isArray(draft.sections)) return null;

          const usableSections = draft.sections.map(function (section) {
            const statements = Array.isArray(section && section.statements)
              ? section.statements.filter(function (statement) {
                  return typeof statement === 'string' && statement.trim().length > 0;
                })
              : [];

            return {
              name: section && typeof section.section_name === 'string'
                ? section.section_name.trim()
                : '',
              statements: statements
            };
          }).filter(function (section) {
            return section.name && section.statements.length;
          });

          return usableSections.length ? usableSections : null;
        } catch (error) {
          return null;
        }
      }

      function renderVision(sections) {
        const fragment = document.createDocumentFragment();

        sections.forEach(function (section, sectionIndex) {
          const article = document.createElement('article');
          article.className = 'vision-card overflow-hidden rounded-[24px] border border-[#dce6eb] bg-white shadow-card';
          article.setAttribute('data-aos', 'fade-up');
          article.setAttribute('data-aos-delay', String(Math.min(sectionIndex * 60, 300)));

          const headingWrap = document.createElement('div');
          headingWrap.className = 'border-b border-[#e5ecef] bg-[#fbfcfd] px-5 py-5 sm:px-7';

          const heading = document.createElement('h2');
          heading.className = 'font-serif text-xl leading-7 tracking-[-0.02em] text-imago-navy sm:text-[1.4rem]';
          heading.textContent = section.name;
          headingWrap.appendChild(heading);

          const list = document.createElement('ol');
          list.className = 'divide-y divide-[#e8eef1] px-5 sm:px-7';

          section.statements.forEach(function (statement, index) {
            const item = document.createElement('li');
            item.className = 'vision-statement flex gap-4 py-5 sm:gap-5 sm:py-6';

            const marker = document.createElement('span');
            marker.className = 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e9f6f3] text-xs font-bold text-[#338376]';
            marker.textContent = String(index + 1);

            const text = document.createElement('p');
            text.className = 'text-[15px] leading-7 text-[#344c64] sm:text-base';
            text.textContent = statement;

            item.appendChild(marker);
            item.appendChild(text);
            list.appendChild(item);
          });

          article.appendChild(headingWrap);
          article.appendChild(list);
          fragment.appendChild(article);
        });

        content.appendChild(fragment);
        revealSections.forEach(function (section) {
          section.classList.remove('hidden');
        });
      }

      const draftSections = getDraft();
      if (draftSections) {
        renderVision(draftSections);
      } else {
        emptyState.classList.remove('hidden');
      }

      document.getElementById('printButton').addEventListener('click', function () {
        window.print();
      });
    })();

AOS.init({ once: true, duration: 700, offset: 80 });