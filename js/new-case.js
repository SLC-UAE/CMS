/* Register Case page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("new-case", [{ label: "Register Case" }]);

    // Accordion: sections toggle independently
    function setSection(item, open) {
      item.classList.toggle("open", open);
      item.querySelector(".acc-head").setAttribute("aria-expanded", open);
    }
    document.querySelectorAll("#newCaseAccordion .acc-head").forEach(h =>
      h.addEventListener("click", () => setSection(h.parentElement, !h.parentElement.classList.contains("open"))));

    // Case Start Date: defaults to today; only 3 days can be picked (today, tomorrow, day after)
    const csd = document.getElementById("fCsd");
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const now = new Date();
    const today = iso(now);
    csd.min = today;
    csd.max = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));
    csd.defaultValue = today;  // so Reset restores today
    csd.value = today;

    // Work type options
    const wtSel = document.getElementById("fWorkType");
    D.WORK_TYPES.forEach(w => wtSel.insertAdjacentHTML("beforeend", `<option value="${w.id}">${w.id}</option>`));

    // Team selects
    ["fHod", "fLead", "fTeam", "fAdmin"].forEach(id => {
      const sel = document.getElementById(id);
      D.USERS.forEach(u => sel.insertAdjacentHTML("beforeend", `<option value="${u.id}">${u.name} — ${u.role}</option>`));
    });
    document.getElementById("fHod").value = "u1";

    // Entities
    ["fEntity", "fRelEntity"].forEach(id => {
      const sel = document.getElementById(id);
      sel.insertAdjacentHTML("beforeend", `<option value="">Select entity...</option>`);
      D.ENTITIES.forEach(e => sel.insertAdjacentHTML("beforeend", `<option>${e}</option>`));
    });

    window.onWorkTypeChange = function () {
      const wt = wtSel.value;
      const wtObj = D.WORK_TYPES.find(w => w.id === wt);
      const ctSel = document.getElementById("fCaseType");
      ctSel.innerHTML = "";
      if (!wtObj) {
        ctSel.innerHTML = `<option value="">Select main classification first...</option>`;
        return;
      }
      ctSel.insertAdjacentHTML("beforeend", `<option value="">Select sub-classification...</option>`);
      wtObj.caseTypes.forEach(ct => ctSel.insertAdjacentHTML("beforeend", `<option>${ct}</option>`));
    };

    function validate(forRegister) {
      const errors = [];
      if (!wtSel.value) errors.push("Main Classification is required.");
      if (!document.getElementById("fCaseType").value) errors.push("Sub-Classification is required.");
      const title = document.querySelectorAll('input[placeholder="Enter case title..."]')[0];
      if (!title.value.trim()) errors.push("Case Title is required.");
      if (!document.getElementById("fPcd").value) errors.push("Proposed Completion Date (PCD) is required.");
      if (forRegister) {
        if (!document.getElementById("fHod").value) errors.push("Head of Directorate is required to register the case.");
        if (!document.getElementById("fLead").value) errors.push("Lead Member is required to register the case.");
        if (!Array.from(document.getElementById("fAdmin").selectedOptions).length) errors.push("At least one Administrator is required to register the case.");
        if (!document.getElementById("fEntity").value) errors.push("Requesting Entity Name is required to register the case.");
      }
      return errors;
    }

    function showAlert(errors, success) {
      const box = document.getElementById("formAlertBox");
      if (success) {
        box.innerHTML = `<div class="alert alert-success d-flex align-items-center gap-2" style="border-radius:10px;font-size:13px;"><i class="bi bi-check-circle-fill"></i>${success}</div>`;
      } else {
        box.innerHTML = `<div class="alert alert-danger" style="border-radius:10px;font-size:13px;">
          <div class="fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Please resolve the following before continuing:</div>
          <ul class="mb-0 ps-3">${errors.map(e => `<li>${e}</li>`).join("")}</ul>
        </div>`;
      }
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    document.getElementById("btnSaveRegister").addEventListener("click", function () {
      const errors = validate(true);
      if (errors.length) {
        // Expand any collapsed section containing an empty required field
        document.querySelectorAll("#newCaseAccordion .acc-item").forEach(item => {
          const missing = Array.from(item.querySelectorAll(".form-label-req")).some(l => {
            const f = l.nextElementSibling;
            return f && !f.value.trim();
          });
          if (missing) setSection(item, true);
        });
        showAlert(errors); return;
      }
      const ref = "SLC-" + (D.WORK_TYPES.find(w => w.id === wtSel.value) || { code: "GEN" }).code + "-2026-00" + Math.floor(100 + Math.random() * 800);
      showAlert(null, `Case ${ref} registered successfully.`);
      A.demoActionModal(`Case ${ref} registered successfully.`);
    });

    document.getElementById("btnReset").addEventListener("click", function () {
      document.getElementById("newCaseForm").reset();
      document.getElementById("formAlertBox").innerHTML = "";
      window.onWorkTypeChange();
      A.toast("Form reset.", { icon: "bi-arrow-counterclockwise" });
    });
  });
})();
