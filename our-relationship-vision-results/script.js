tailwind.config = {
      theme: {
        extend: {
          colors: {
            navy: "#17375f",
            teal: "#4FAE9E",
            canvas: "#f5f7f4",
            mist: "#eaf2ef",
            ink: "#273d52"
          },
          fontFamily: {
            sans: ["DM Sans", "sans-serif"],
            serif: ["Georgia", "Cambria", "Times New Roman", "serif"]
          },
          boxShadow: {
            soft: "0 18px 50px rgba(23,55,95,.08)",
            card: "0 8px 28px rgba(23,55,95,.065)"
          }
        }
      }
    }

(() => {
      const storageKey = "imago_our_relationship_vision_v1";
      const endpoint = "/api/public/landing-pages/6421/sheet-data";
      const params = new URLSearchParams(window.location.search);
      const submissionId = params.get("submission_id") || "";
      window.IMAGO_RESULT_CONTEXT = { submissionId };

      const show = id => document.getElementById(id).classList.remove("hidden");
      const hide = id => document.getElementById(id).classList.add("hidden");
      const textValue = value => typeof value === "string" ? value : "";
      const isBlank = value => !String(value || "").trim();

      let data = null;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") data = parsed;
        }
      } catch (_) {}

      const parseRows = payload => {
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload.rows)) return payload.rows;
        if (payload && Array.isArray(payload.data)) return payload.data;
        if (payload && Array.isArray(payload.results)) return payload.results;
        return [];
      };

      const parseList = raw => {
        const text = textValue(raw).trim();
        if (!text) return [];
        if (text.includes("|||ITEM|||")) {
          return text.split("|||ITEM|||").map(s => s.trim()).filter(Boolean);
        }
        if (text.includes("|||")) {
          return text.split("|||").map(s => s.trim()).filter(Boolean);
        }
        return [text];
      };

      const pickBestRow = rows => {
        const normalized = Array.isArray(rows) ? rows.filter(r => r && typeof r === "object") : [];
        if (submissionId) {
          return normalized.find(row => String(row.submission_id || "").trim() === submissionId) || null;
        }
        const completed = normalized.filter(row => {
          const statements = parseList(row.shared_vision_statements);
          return statements.length || !isBlank(row.shared_raw) || !isBlank(row.different_raw);
        });
        return completed[0] || null;
      };

      const renderFromRow = row => {
        const shaped = parseList(row.shared_vision_statements);
        const sharedRaw = textValue(row.shared_raw).trim();
        const differentRaw = textValue(row.different_raw);
        const hasLocalFallback = Boolean(data && (parseList(data.final_shaped).length || parseList(data.final_shaped_array).length || parseList(data.shaped).length || parseList(data.shaped_shared).length || parseList(data.shared_shaped).length || parseList(data.vision_statements).length || textValue(data.shared_raw).trim() || textValue(data.different_raw).trim()));

        ["shared-content", "potential-content", "closing-content", "actions-content"].forEach(show);
        hide("loading-state");
        hide("empty-state");

        const container = document.getElementById("vision-statements");
        container.innerHTML = "";

        if (shaped.length) {
          shaped.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "statement-card print-card relative flex gap-5 rounded-[1.4rem] border border-navy/10 bg-white py-6 pl-7 pr-5 shadow-card sm:gap-7 sm:py-7 sm:pl-9 sm:pr-8";
            card.setAttribute("data-aos", "fade-up");
            card.setAttribute("data-aos-delay", String(Math.min(index * 70, 300)));

            const number = document.createElement("span");
            number.className = "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-teal";
            number.textContent = String(index + 1).padStart(2, "0");

            const copy = document.createElement("p");
            copy.className = "self-center font-serif text-lg leading-8 text-navy sm:text-xl sm:leading-9";
            copy.textContent = item;

            card.append(number, copy);
            container.appendChild(card);
          });
        } else {
          show("shared-raw-card");
          document.getElementById("shared-raw").textContent = sharedRaw || textValue(data && data.shared_raw).trim();
        }

        if (differentRaw.trim()) {
          document.getElementById("different-raw").textContent = differentRaw;
          hide("different-empty");
        } else {
          show("different-empty");
        }

        if (!shaped.length && !sharedRaw && !differentRaw.trim() && !hasLocalFallback) {
          // no-op: keep empty state hidden for secured rows only when a row exists
        }
      };

      const renderLocalFallback = () => {
        const shapedCandidates = data && [
          data.final_shaped,
          data.final_shaped_array,
          data.shaped,
          data.shaped_shared,
          data.shared_shaped,
          data.vision_statements
        ];
        const shaped = shapedCandidates
          ? shapedCandidates.find(value => Array.isArray(value) && value.some(item => String(item || "").trim()))
          : null;
        const sharedRaw = data ? textValue(data.shared_raw).trim() : "";
        const differentRaw = data ? textValue(data.different_raw) : "";
        const hasContent = Boolean((shaped && shaped.length) || sharedRaw || differentRaw.trim());

        if (!hasContent) {
          hide("loading-state");
          show("empty-state");
          return;
        }

        ["shared-content", "potential-content", "closing-content", "actions-content"].forEach(show);

        if (shaped && shaped.length) {
          const container = document.getElementById("vision-statements");
          container.innerHTML = "";
          shaped.filter(item => String(item || "").trim()).forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "statement-card print-card relative flex gap-5 rounded-[1.4rem] border border-navy/10 bg-white py-6 pl-7 pr-5 shadow-card sm:gap-7 sm:py-7 sm:pl-9 sm:pr-8";
            card.setAttribute("data-aos", "fade-up");
            card.setAttribute("data-aos-delay", String(Math.min(index * 70, 300)));

            const number = document.createElement("span");
            number.className = "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-teal";
            number.textContent = String(index + 1).padStart(2, "0");

            const copy = document.createElement("p");
            copy.className = "self-center font-serif text-lg leading-8 text-navy sm:text-xl sm:leading-9";
            copy.textContent = String(item).trim();

            card.append(number, copy);
            container.appendChild(card);
          });
        } else {
          show("shared-raw-card");
          document.getElementById("shared-raw").textContent = sharedRaw;
        }

        if (differentRaw.trim()) {
          document.getElementById("different-raw").textContent = differentRaw;
        } else {
          show("different-empty");
        }
      };

      const load = async () => {
        show("loading-state");

        let timeoutId = null;
        let pollTimer = null;
        let finished = false;

        const finish = fn => {
          if (finished) return;
          finished = true;
          if (timeoutId) clearTimeout(timeoutId);
          if (pollTimer) clearInterval(pollTimer);
          fn();
        };

        const fetchAndRender = async () => {
          try {
            const response = await fetch(endpoint, { credentials: "same-origin" });
            if (!response.ok) return null;
            const payload = await response.json();
            const row = pickBestRow(parseRows(payload));
            if (row) {
              finish(() => renderFromRow(row));
              return row;
            }
            return null;
          } catch (_) {
            return null;
          }
        };

        const initialRow = await fetchAndRender();
        if (initialRow) return;

        if (submissionId) {
          let elapsed = 0;
          pollTimer = setInterval(async () => {
            if (finished) return;
            elapsed += 3000;
            const row = await fetchAndRender();
            if (row) return;
            if (elapsed >= 90000) {
              finish(() => renderLocalFallback());
            }
          }, 3000);

          timeoutId = setTimeout(() => {
            finish(() => renderLocalFallback());
          }, 90000);
        } else {
          finish(() => renderLocalFallback());
        }
      };

      load();
    })();

AOS.init({ once: true, duration: 700, offset: 80 });