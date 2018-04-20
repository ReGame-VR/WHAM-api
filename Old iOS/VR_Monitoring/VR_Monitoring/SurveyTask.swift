//
//  SurveyTask.swift
//  VR_Monitoring
//
//  Created by Sarada Symonds on 2/27/16.
//  Copyright (c) 2016 NU Enabling Engineering. All rights reserved.
//
import ResearchKit

public var SurveyTask: ORKOrderedTask {
    
    var steps = [ORKStep]()
    
    //add survey questions in swift
    let step1AnswerFormat = ORKAnswerFormat.scaleAnswerFormatWithMaximumValue(10, minimumValue: 1, defaultValue: NSIntegerMax, step: 1, vertical: false, maximumValueDescription: "High Value", minimumValueDescription: "Low value")
    
    let questionStep1 = ORKQuestionStep(identifier: "ScaleQuestionTask", title: "How would you rate your effort?", answer: step1AnswerFormat)
    
    questionStep1.text = "How would you rate your effort?"
    
    steps += [questionStep1]
    
    return ORKOrderedTask(identifier: "SurveyTask", steps: steps)
}
