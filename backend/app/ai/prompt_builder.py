import logging
from app.models.submission import Submission
from app.models.prompt_template import PromptTemplate

logger = logging.getLogger(__name__)


class PromptBuilder:
    """
    Assembles the final (system_prompt, user_prompt) tuple from:
    - The active PromptTemplate loaded from the DB
    - The knowledge context dict from KnowledgeLoader
    - The user's Submission data
    """

    def build(
        self,
        submission:    Submission,
        knowledge_ctx: dict[str, str],
        template:      PromptTemplate,
    ) -> tuple[str, str]:
        """
        Returns (system_prompt, user_prompt).
        Raises ValueError if the template is missing required placeholders.
        """
        try:
            user_prompt = template.prompt_text.format(
                nickname           = submission.nickname,
                mbti_type          = submission.mbti_type,
                mbti_context       = knowledge_ctx["mbti"],
                hd_type            = submission.hd_type,
                hd_type_context    = knowledge_ctx["hd_type"],
                hd_authority       = submission.hd_authority,
                hd_authority_context = knowledge_ctx["hd_authority"],
                hd_profile         = submission.hd_profile,
                hd_profile_context = knowledge_ctx["hd_profile"],
                current_occupation = submission.current_occupation,
                burnout_triggers   = submission.burnout_triggers,
                success_vision     = submission.success_vision,
            )
        except KeyError as exc:
            raise ValueError(
                f"Prompt template is missing placeholder: {exc}. "
                "Update the template in the admin panel."
            ) from exc

        logger.debug(
            f"[PromptBuilder] User prompt length: {len(user_prompt)} chars | "
            f"System context length: {len(template.system_context)} chars"
        )

        return template.system_context, user_prompt


prompt_builder = PromptBuilder()
